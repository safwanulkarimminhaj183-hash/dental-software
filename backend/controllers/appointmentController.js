// backend/controllers/appointmentController.js
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// ── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9am–5pm
const SLOT_DURATION_MINUTES = 30;

/**
 * @desc   Book an appointment
 * @route  POST /api/appointments/book
 * @access Protected (patient)
 *
 * Body: { doctorId, slot (ISO string), reason? }
 *
 * Uses a MongoDB transaction so the read-then-write is atomic.
 * The partial unique index on (doctorId, slot) for active statuses
 * acts as the final guard against races.
 */
export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slot, reason } = req.body;
  const patientId = req.user._id;

  if (!doctorId || !slot) {
    return res.status(400).json({ success: false, message: 'doctorId and slot are required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: 'Invalid doctorId.' });
  }

  const slotDate = new Date(slot);
  if (isNaN(slotDate.getTime())) {
    return res.status(400).json({ success: false, message: 'slot must be a valid ISO date string.' });
  }
  if (slotDate <= new Date()) {
    return res.status(400).json({ success: false, message: 'Cannot book a slot in the past.' });
  }

  // ── Atomic booking via session transaction ─────────────────────────────────
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctor = await Doctor.findById(doctorId).session(session);
    if (!doctor || !doctor.isActive) {
      throw Object.assign(new Error('Doctor not found.'), { statusCode: 404 });
    }

    // Check if this patient already has a booked appointment at the same slot
    const patientConflict = await Appointment.findOne({
      patientId,
      slot: slotDate,
      status: { $in: ['booked', 'confirmed'] },
    }).session(session);

    if (patientConflict) {
      throw Object.assign(
        new Error('You already have an appointment booked at this time.'),
        { statusCode: 409 }
      );
    }

    // Create — the partial unique index will throw code 11000 on a race condition
    const [appointment] = await Appointment.create(
      [{ patientId, doctorId, slot: slotDate, reason, status: 'booked' }],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment,
    });
  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This slot was just taken. Please choose another time.',
      });
    }
    throw err;
  } finally {
    session.endSession();
  }
});

/**
 * @desc   Get available slots for a doctor on a given date
 * @route  GET /api/appointments/available-slots?doctorId=...&date=YYYY-MM-DD
 * @access Protected
 *
 * Merges the doctor's custom availability schedule (if defined) with
 * a generic 9am–5pm hourly grid, then removes already-booked slots.
 */
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({
      success: false,
      message: 'doctorId and date (YYYY-MM-DD) query params are required.',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: 'Invalid doctorId.' });
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  if (isNaN(dayStart.getTime())) {
    return res.status(400).json({ success: false, message: 'date must be in YYYY-MM-DD format.' });
  }
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const [doctor, bookedAppointments] = await Promise.all([
    Doctor.findById(doctorId).lean(),
    Appointment.find({
      doctorId,
      slot: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['booked', 'confirmed'] },
    }).select('slot -_id').lean(),
  ]);

  if (!doctor || !doctor.isActive) {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }

  const bookedSet = new Set(bookedAppointments.map((a) => a.slot.toISOString()));

  // Build candidate slots from doctor's custom availability for the day,
  // falling back to the generic grid if no custom schedule is set.
  const dayAvailability = doctor.availability?.find(
    (a) => new Date(a.date).toDateString() === dayStart.toDateString()
  );

  let candidateSlots;
  if (dayAvailability?.slots?.length) {
    candidateSlots = dayAvailability.slots
      .filter((s) => !s.isBlocked)
      .map((s) => {
        const [h, m] = s.time.split(':').map(Number);
        const d = new Date(dayStart);
        d.setUTCHours(h, m, 0, 0);
        return { time: s.time, datetime: d, durationMinutes: s.durationMinutes || SLOT_DURATION_MINUTES };
      });
  } else {
    candidateSlots = DEFAULT_SLOT_HOURS.flatMap((hour) => {
      return [0, SLOT_DURATION_MINUTES].map((min) => {
        const d = new Date(dayStart);
        d.setUTCHours(hour, min, 0, 0);
        const hh = String(hour).padStart(2, '0');
        const mm = String(min).padStart(2, '0');
        return { time: `${hh}:${mm}`, datetime: d, durationMinutes: SLOT_DURATION_MINUTES };
      });
    });
  }

  const availableSlots = candidateSlots.filter(
    (s) => !bookedSet.has(s.datetime.toISOString()) && s.datetime > new Date()
  );

  res.json({
    success: true,
    doctorId,
    date,
    availableSlots,
  });
});

/**
 * @desc   Get all appointments for the authenticated patient
 * @route  GET /api/appointments/my
 * @access Protected (patient)
 */
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user._id })
    .sort({ slot: -1 })
    .populate('doctorId', 'name specialty photoUrl')
    .lean();

  res.json({ success: true, count: appointments.length, appointments });
});

/**
 * @desc   Cancel an appointment
 * @route  PATCH /api/appointments/:id/cancel
 * @access Protected (owning patient or staff/admin)
 */
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  // Ownership check — patients can only cancel their own
  const isAdmin = ['admin', 'staff'].includes(req.user.role);
  if (!isAdmin && appointment.patientId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised to cancel this appointment.' });
  }

  if (['cancelled', 'completed'].includes(appointment.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel an appointment with status "${appointment.status}".`,
    });
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = isAdmin ? 'staff' : 'patient';
  appointment.cancellationReason = req.body.reason || '';
  await appointment.save();

  res.json({ success: true, message: 'Appointment cancelled.', appointment });
});

/**
 * @desc   Get all appointments (admin/staff dashboard)
 * @route  GET /api/appointments/all
 * @access Protected (admin, staff)
 */
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, doctorId, date, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) filter.doctorId = doctorId;
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    filter.slot = { $gte: start, $lte: new Date(`${date}T23:59:59.999Z`) };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ slot: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'name specialty')
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    appointments,
  });
});
