import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import { sendAppointmentEmails } from '../utils/mailer.js';

/**
 * @desc    Book / Create a new appointment
 * @route   POST /api/appointment OR POST /api/appointments
 * @access  Public
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      name,
      patientEmail,
      email,
      patientPhone,
      phone,
      serviceName,
      service,
      department,
      doctorId,
      doctorName,
      appointmentDate,
      date,
      appointmentTime,
      time,
      status,
      notes,
      message,
    } = req.body;

    // Resolve fields supporting both standard and alias field names
    const resolvedName = (name || patientName || '').trim();
    const resolvedEmail = (email || patientEmail || '').trim().toLowerCase();
    const resolvedPhone = (phone || patientPhone || '').trim();
    const resolvedDepartment = (department || serviceName || service || 'General Dentistry').trim();
    const resolvedDate = appointmentDate || date;
    const resolvedTime = (appointmentTime || time || '10:00 AM').trim();
    const resolvedDoctorName = (doctorName || 'General Dentist').trim();
    const resolvedNotes = (notes || message || '').trim();

    const parsedDate = new Date(resolvedDate);

    // Normalize initial status
    let resolvedStatus = 'Pending';
    if (status) {
      const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      resolvedStatus = s === 'Confirmed' ? 'Approved' : s;
    }

    // --- SLOT CHECKING (Collision Detection) ---
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const existingAppointment = await Appointment.findOne({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: resolvedTime,
      status: { $nin: ['Cancelled', 'cancelled', 'Completed', 'completed'] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: `The time slot ${resolvedTime} on ${parsedDate.toDateString()} is already booked. Please choose another time.`,
      });
    }

    // Create appointment in database
    const newAppointment = await Appointment.create({
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      department: resolvedDepartment,
      doctorId: doctorId || null,
      doctorName: resolvedDoctorName,
      appointmentDate: parsedDate,
      appointmentTime: resolvedTime,
      status: resolvedStatus,
      notes: resolvedNotes,
    });

    // Trigger dual automated notification emails via Nodemailer
    sendAppointmentEmails({
      name: newAppointment.name,
      email: newAppointment.email,
      phone: newAppointment.phone,
      department: newAppointment.department,
      appointmentDate: newAppointment.appointmentDate,
      appointmentTime: newAppointment.appointmentTime,
      notes: newAppointment.notes,
      status: newAppointment.status,
      createdAt: newAppointment.createdAt,
    }).catch((mailErr) => {
      console.warn('⚠️ Nodemailer background delivery failed (Appointment):', mailErr.message);
    });

    // --- NOTIFICATION SYSTEM (Admin/Doctor Real-time Alerts) ---
    try {
      const { broadcastGlobal } = await import('../utils/socketServer.js');
      broadcastGlobal('admin:appointment_created', {
        message: `New appointment booked by ${newAppointment.name} for ${resolvedTime}`,
        appointmentId: newAppointment._id,
        department: newAppointment.department,
      });
    } catch (socketErr) {
      console.warn('⚠️ Failed to broadcast real-time alert:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Your appointment has been booked successfully! A confirmation email has been sent.',
      data: newAppointment,
    });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while booking appointment.',
    });
  }
};

/**
 * @desc    Fetch all appointments (Admin/Doctor view with filters)
 * @route   GET /api/appointments OR GET /api/appointment
 * @access  Admin / Protected
 */
export const getAllAppointments = async (req, res) => {
  try {
    const { status, department, doctorName, date, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      const mapped = normalizedStatus === 'Confirmed' ? 'Approved' : normalizedStatus;
      filter.$or = [{ status: mapped }, { status: status.toLowerCase() }];
    }

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    if (doctorName) {
      filter.doctorName = { $regex: doctorName, $options: 'i' };
    }

    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
        filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({
        appointmentDate: -1,
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: appointments.length,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
      data: appointments,
    });
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching appointments.',
    });
  }
};

/**
 * @desc    Change / Update appointment status
 * @route   PATCH /api/appointments/:id OR PATCH /api/appointments/:id/status
 * @access  Admin / Protected
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format.',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide a status ('Pending', 'Approved', 'Replied', 'Cancelled', 'Completed').",
      });
    }

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const mappedStatus = normalizedStatus === 'Confirmed' ? 'Approved' : normalizedStatus;

    const allowed = ['Pending', 'Approved', 'Replied', 'Cancelled', 'Completed', 'pending', 'confirmed', 'cancelled'];
    if (!allowed.includes(mappedStatus) && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: Pending, Approved, Replied, Cancelled, Completed.`,
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: mappedStatus },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to '${mappedStatus}' successfully.`,
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('❌ Error updating appointment status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating appointment status.',
    });
  }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Admin / Protected
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format.',
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update entire appointment
 * @route   PUT /api/appointments/:id
 * @access  Admin / Protected
 */
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format.',
      });
    }

    const updated = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Admin / Protected
 */
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format.',
      });
    }

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
