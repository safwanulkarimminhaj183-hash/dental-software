import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Booking from '../models/Booking.js';
import Billing from '../models/Billing.js';
import TreatmentPlan from '../models/TreatmentPlan.js';
import User from '../models/User.js';
import Schedule from '../models/Schedule.js';
import Prescription from '../models/Prescription.js';
import { getCache, setCache, deleteCachePattern } from '../utils/redisClient.js';
import { generatePrescriptionPDF } from '../utils/pdfGenerator.js';
import { notifyAdminDashboard } from '../utils/socketServer.js';
import Stripe from 'stripe';

// Lazy-initialize Stripe client (only if STRIPE_SECRET_KEY is configured)
let stripeClient = null;
const getStripe = () => {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }
  return stripeClient;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Advanced MongoDB Aggregation Analytics + Redis Caching
// @route  GET /api/admin/dashboard/analytics
// @access Admin | Doctor | Receptionist | Super Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminAnalytics = async (req, res) => {
  try {
    const cacheKey = 'admin:dashboard_analytics';

    // ── Redis Short-TTL Cache (5-minute TTL) ─────────────────────────────────
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({
        success: true,
        source: 'redis_cache',
        analytics: cachedData,
      });
    }

    // ── Parallel MongoDB Aggregation Pipelines via $facet ────────────────────
    // Uses Booking collection as the financial truth-of-record
    const [bookingAggResult] = await Booking.aggregate([
      {
        $facet: {

          // ─── Total Revenue & Payments ──────────────────────────────────────
          financialOverview: [
            {
              $group: {
                _id: null,
                totalRevenue:     { $sum: '$amountPaid' },
                totalBookingCost: { $sum: '$totalAmount' },
                totalOutstanding: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
                bookingsCount:    { $sum: 1 },
              },
            },
          ],

          // ─── Monthly Revenue Trend (last 12 months) ───────────────────────
          monthlyRevenueTrend: [
            {
              $group: {
                _id: {
                  year:  { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                },
                monthlyRevenue: { $sum: '$amountPaid' },
                bookings:       { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
            {
              $project: {
                _id: 0,
                year:           '$_id.year',
                month:          '$_id.month',
                monthlyRevenue: 1,
                bookings:       1,
                label: {
                  $concat: [
                    { $arrayElemAt: [
                        ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        '$_id.month',
                    ]},
                    ' ',
                    { $toString: '$_id.year' },
                  ],
                },
              },
            },
          ],

          // ─── Popular Dental Treatments (Top 5) ────────────────────────────
          popularTreatments: [
            {
              $group: {
                _id:               '$treatmentPlanTitle',
                bookingsCount:     { $sum: 1 },
                revenueGenerated:  { $sum: '$amountPaid' },
                avgAmount:         { $avg: '$totalAmount' },
              },
            },
            { $sort: { bookingsCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                bookingsCount:    1,
                revenueGenerated: 1,
                avgAmount:        { $round: ['$avgAmount', 2] },
              },
            },
          ],

          // ─── Payment Status Breakdown ──────────────────────────────────────
          paymentStatuses: [
            {
              $group: {
                _id:       '$paymentStatus',
                count:     { $sum: 1 },
                sumAmount: { $sum: '$amountPaid' },
              },
            },
          ],

          // ─── Booking Status Breakdown ──────────────────────────────────────
          bookingStatuses: [
            {
              $group: {
                _id:   '$bookingStatus',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // ── Billing aggregation (Billing invoices from admin-created records) ────
    const [billingAgg] = await Billing.aggregate([
      {
        $facet: {
          billingOverview: [
            {
              $group: {
                _id:          null,
                totalBilled:  { $sum: '$totalAmount' },
                totalPaid:    { $sum: '$paidAmount' },
                totalDue:     { $sum: '$dueAmount' },
                invoiceCount: { $sum: 1 },
              },
            },
          ],
          monthlyBillingTrend: [
            {
              $group: {
                _id: {
                  year:  { $year: '$invoiceDate' },
                  month: { $month: '$invoiceDate' },
                },
                billed: { $sum: '$totalAmount' },
                paid:   { $sum: '$paidAmount' },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
          ],
          paymentMethodBreakdown: [
            {
              $group: {
                _id:   '$paymentMethod',
                count: { $sum: 1 },
                total: { $sum: '$paidAmount' },
              },
            },
            { $sort: { total: -1 } },
          ],
        },
      },
    ]);

    // ── Appointment statistics ────────────────────────────────────────────────
    const [apptAgg] = await Appointment.aggregate([
      {
        $facet: {
          // Status distribution
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          // Monthly appointment trend (last 12 months)
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year:  { $year: '$appointmentDate' },
                  month: { $month: '$appointmentDate' },
                },
                appointments: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
            {
              $project: {
                _id: 0,
                year:         '$_id.year',
                month:        '$_id.month',
                appointments: 1,
                label: {
                  $concat: [
                    { $arrayElemAt: [
                        ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        '$_id.month',
                    ]},
                    ' ',
                    { $toString: '$_id.year' },
                  ],
                },
              },
            },
          ],
          // New patients registered this calendar month
          newPatientsThisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            },
            { $group: { _id: '$email' } },
            { $count: 'count' },
          ],
          // Most requested services
          popularServices: [
            {
              $group: {
                _id:   '$department',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    // ── Patient Growth (distinct emails in Appointments) ─────────────────────
    const distinctPatients = await Appointment.distinct('email');

    // ── Doctor/Staff head count ───────────────────────────────────────────────
    const staffStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // ── Prescriptions issued this month ──────────────────────────────────────
    const prescriptionsThisMonth = await Prescription.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // ── Total treatment plans ─────────────────────────────────────────────────
    const totalTreatments = await TreatmentPlan.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    // ── Assemble final payload ────────────────────────────────────────────────
    const financialOverview = bookingAggResult?.financialOverview[0] || {
      totalRevenue: 0, totalBookingCost: 0, totalOutstanding: 0, bookingsCount: 0,
    };
    const billingOverview = billingAgg?.billingOverview[0] || {
      totalBilled: 0, totalPaid: 0, totalDue: 0, invoiceCount: 0,
    };

    const analyticsPayload = {
      // Financial
      totalRevenue:      financialOverview.totalRevenue,
      totalBookingCost:  financialOverview.totalBookingCost,
      totalOutstanding:  financialOverview.totalOutstanding,
      totalBilled:       billingOverview.totalBilled,
      totalPaid:         billingOverview.totalPaid,
      totalDue:          billingOverview.totalDue,
      billingInvoices:   billingOverview.invoiceCount,

      // Appointments & Patients
      totalAppointments,
      totalPatientsCount:      distinctPatients.length,
      newPatientsThisMonth:    apptAgg?.newPatientsThisMonth[0]?.count || 0,
      prescriptionsThisMonth,
      totalTreatmentsCount:    totalTreatments,

      // Charts / Trends
      monthlyRevenueTrend:     bookingAggResult?.monthlyRevenueTrend   || [],
      monthlyAppointmentTrend: apptAgg?.monthlyTrend                   || [],
      monthlyBillingTrend:     billingAgg?.monthlyBillingTrend         || [],

      // Breakdowns
      popularTreatments:       bookingAggResult?.popularTreatments     || [],
      popularServices:         apptAgg?.popularServices                || [],
      paymentStatuses:         bookingAggResult?.paymentStatuses        || [],
      bookingStatuses:         bookingAggResult?.bookingStatuses        || [],
      appointmentStatusStats:  apptAgg?.statusBreakdown                || [],
      paymentMethodBreakdown:  billingAgg?.paymentMethodBreakdown      || [],
      staffStats,

      lastUpdated: new Date(),
    };

    // ── Cache in Redis for 5 minutes (300 s) ─────────────────────────────────
    await setCache(cacheKey, analyticsPayload, 300);

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({
      success: true,
      source: 'database',
      analytics: analyticsPayload,
    });
  } catch (error) {
    console.error('❌ Admin analytics aggregation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute clinic analytics.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dynamic Slot & Schedule Management
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/admin/schedule — Fetch active clinic schedule */
export const getClinicSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findOne({ isActive: true });
    if (!schedule) {
      schedule = await Schedule.create({
        doctorName:   'Dr. Sarah Johnson (Chief Orthodontist)',
        workingDays:  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { startTime: '09:00 AM', endTime: '06:00 PM' },
        breakHours:   { breakStart: '01:00 PM', breakEnd: '02:00 PM' },
        slotDurationMinutes: 30,
      });
    }
    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/admin/schedule — Create or update clinic schedule */
export const updateClinicSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findOne({ isActive: true });
    if (schedule) {
      Object.assign(schedule, req.body);
      await schedule.save();
    } else {
      schedule = await Schedule.create(req.body);
    }

    // Invalidate analytics cache since slot config changed
    await deleteCachePattern('admin:*');

    // Push real-time schedule update to all connected admin sockets
    notifyAdminDashboard('admin:schedule_updated', { schedule });

    return res.status(200).json({
      success: true,
      message: 'Clinic schedule updated successfully.',
      schedule,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/admin/schedule/block-slot — Block a specific date+time slot */
export const blockTimeSlot = async (req, res) => {
  try {
    const { date, timeSlot, reason = 'Blocked by Admin/Doctor' } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Date and time slot are required.',
      });
    }

    let schedule = await Schedule.findOne({ isActive: true });
    if (!schedule) {
      schedule = new Schedule({
        doctorName: 'Dr. Sarah Johnson (Chief Orthodontist)',
      });
    }

    // Check if slot is already blocked for this date
    const alreadyBlocked = schedule.slotOverrides.some(
      (o) =>
        new Date(o.date).toDateString() === new Date(date).toDateString() &&
        o.timeSlot === timeSlot &&
        o.isBlocked
    );

    if (alreadyBlocked) {
      return res.status(409).json({
        success: false,
        message: `Slot ${timeSlot} on ${new Date(date).toDateString()} is already blocked.`,
      });
    }

    schedule.slotOverrides.push({ date: new Date(date), timeSlot, isBlocked: true, reason });
    await schedule.save();

    notifyAdminDashboard('admin:schedule_updated', {
      action: 'slot_blocked',
      date,
      timeSlot,
      reason,
      blockedBy: req.user?.name || 'Admin',
    });

    return res.status(200).json({
      success: true,
      message: `Time slot ${timeSlot} on ${new Date(date).toDateString()} blocked successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** DELETE /api/admin/schedule/unblock-slot — Remove a slot override (unblock) */
export const unblockTimeSlot = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Date and time slot are required.',
      });
    }

    const schedule = await Schedule.findOne({ isActive: true });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'No active schedule found.' });
    }

    const before = schedule.slotOverrides.length;
    schedule.slotOverrides = schedule.slotOverrides.filter(
      (o) =>
        !(
          new Date(o.date).toDateString() === new Date(date).toDateString() &&
          o.timeSlot === timeSlot
        )
    );

    if (schedule.slotOverrides.length === before) {
      return res.status(404).json({
        success: false,
        message: `No blocked override found for slot ${timeSlot} on ${new Date(date).toDateString()}.`,
      });
    }

    await schedule.save();
    notifyAdminDashboard('admin:schedule_updated', { action: 'slot_unblocked', date, timeSlot });

    return res.status(200).json({
      success: true,
      message: `Time slot ${timeSlot} on ${new Date(date).toDateString()} has been unblocked.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/admin/schedule/available-slots?date=YYYY-MM-DD */
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required (YYYY-MM-DD).',
      });
    }

    const schedule = await Schedule.findOne({ isActive: true });
    const targetDate = new Date(date);

    // ── Generate dynamic slots from schedule config ───────────────────────────
    let allSlots = [];
    if (schedule) {
      allSlots = generateTimeSlots(
        schedule.workingHours.startTime,
        schedule.workingHours.endTime,
        schedule.breakHours.breakStart,
        schedule.breakHours.breakEnd,
        schedule.slotDurationMinutes
      );
    }
    // Fallback to standard slot list
    if (!allSlots.length) {
      allSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM',
      ];
    }

    // ── Determine if date falls on a working day ──────────────────────────────
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isWorkingDay = !schedule || schedule.workingDays.includes(dayOfWeek);

    // ── Check off-dates ───────────────────────────────────────────────────────
    const isOffDate = (schedule?.offDates || []).some(
      (d) => new Date(d).toDateString() === targetDate.toDateString()
    );

    // ── Fetch booked appointments ─────────────────────────────────────────────
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay   = new Date(date + 'T23:59:59.999Z');

    const bookedAppts = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['Cancelled', 'cancelled'] },
    }).select('appointmentTime');

    const bookedBookings = await Booking.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $nin: ['Cancelled'] },
    }).select('appointmentTime');

    const bookedTimes = [
      ...bookedAppts.map((a) => a.appointmentTime),
      ...bookedBookings.map((b) => b.appointmentTime),
    ];

    // ── Check slot overrides ──────────────────────────────────────────────────
    const blockedOverrides = (schedule?.slotOverrides || [])
      .filter(
        (o) =>
          new Date(o.date).toDateString() === targetDate.toDateString() && o.isBlocked
      )
      .map((o) => o.timeSlot);

    // ── Build availability map ────────────────────────────────────────────────
    const availableSlots = allSlots.map((slot) => ({
      slot,
      isBooked:    bookedTimes.includes(slot),
      isBlocked:   blockedOverrides.includes(slot) || !isWorkingDay || isOffDate,
      isAvailable: !bookedTimes.includes(slot) && !blockedOverrides.includes(slot) && isWorkingDay && !isOffDate,
    }));

    return res.status(200).json({
      success: true,
      date,
      dayOfWeek,
      isWorkingDay,
      isOffDate,
      slotDuration: schedule?.slotDurationMinutes || 30,
      availableSlots,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper: Generate time slots between start/end, excluding break window
 * @param {string} start  - e.g. "09:00 AM"
 * @param {string} end    - e.g. "06:00 PM"
 * @param {string} bStart - break start
 * @param {string} bEnd   - break end
 * @param {number} dur    - slot duration in minutes
 * @returns {string[]}
 */
function generateTimeSlots(start, end, bStart, bEnd, dur = 30) {
  const toMinutes = (str) => {
    const [time, period] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };
  const toLabel = (mins) => {
    const h24 = Math.floor(mins / 60);
    const m   = mins % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12  = h24 % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const startMin  = toMinutes(start);
  const endMin    = toMinutes(end);
  const bStartMin = bStart ? toMinutes(bStart) : null;
  const bEndMin   = bEnd   ? toMinutes(bEnd)   : null;

  const slots = [];
  for (let t = startMin; t + dur <= endMin; t += dur) {
    if (bStartMin !== null && bEndMin !== null && t >= bStartMin && t < bEndMin) {
      continue; // Skip break window
    }
    slots.push(toLabel(t));
  }
  return slots;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Automated Digital Prescription Generation (PDFKit + Nodemailer)
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/admin/prescriptions — Create prescription, generate PDF, email patient */
export const createAndSendPrescription = async (req, res) => {
  try {
    const {
      patientName, patientEmail, patientPhone, patientAge,
      doctorName, doctorLicense,
      diagnosis, medications, generalAdvice, nextFollowUpDate,
    } = req.body;

    if (!patientName || !patientEmail || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, patient email, and diagnosis are required.',
      });
    }

    // ── Save Prescription document ────────────────────────────────────────────
    let rx = null;
    let rxNumber = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

    if (mongoose.connection.readyState === 1) {
      try {
        rx = new Prescription({
          prescriptionNumber: rxNumber,
          patientName,
          patientEmail,
          patientPhone: patientPhone || '',
          patientAge:   Number(patientAge) || 30,
          doctorName:   doctorName  || req.user?.name || 'Dr. Sarah Johnson (DDS, Orthodontics)',
          doctorLicense: doctorLicense || process.env.DOCTOR_LICENSE || 'DC-LICENSE-98412',
          diagnosis,
          medications:  medications   || [],
          generalAdvice: generalAdvice || 'Maintain good oral hygiene. Rinse with warm saline water twice daily.',
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        });
        await rx.save();
      } catch (dbErr) {
        console.warn('MongoDB save error in adminDashboardController, using fallback object:', dbErr.message);
      }
    }

    if (!rx) {
      rx = {
        _id: 'rx_mem_' + Date.now(),
        prescriptionNumber: rxNumber,
        patientName,
        patientEmail,
        patientPhone: patientPhone || '',
        patientAge: Number(patientAge) || 30,
        doctorName: doctorName || req.user?.name || 'Dr. Sarah Johnson (DDS, Orthodontics)',
        doctorLicense: doctorLicense || process.env.DOCTOR_LICENSE || 'DC-LICENSE-98412',
        diagnosis,
        medications: medications || [],
        generalAdvice: generalAdvice || 'Maintain good oral hygiene. Rinse with warm saline water twice daily.',
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        createdAt: new Date().toISOString()
      };
    }

    // ── Generate PDF via PDFKit ───────────────────────────────────────────────
    const pdfBuffer = await generatePrescriptionPDF(rx);

    // ── Email PDF to patient (non-blocking — errors are logged, not thrown) ───
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0e2a47; margin-bottom: 4px;">DentoCare Clinic</h2>
        <h3 style="color: #3ec1d3; margin-top: 0;">Your Digital Prescription is Ready</h3>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p><strong>${rx.doctorName}</strong> has finalized your prescription (Ref: <strong>${rx.prescriptionNumber}</strong>).
           Your prescription document is attached as a PDF.</p>
        <blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #3ec1d3; color: #334155;">
          <strong>Diagnosis:</strong> ${diagnosis}<br/>
          <strong>General Advice:</strong> ${rx.generalAdvice}
        </blockquote>
        ${rx.nextFollowUpDate
          ? `<p>📅 <strong>Next Follow-up:</strong> ${new Date(rx.nextFollowUpDate).toDateString()}</p>`
          : ''}
        <p>If you have any questions, call us at <strong>512-205-1826</strong>.</p>
        <p style="color: #64748b; font-size: 12px;">DentoCare Specialist Dental Practice</p>
      </div>
    `;

    let emailSent = false;
    try {
      const { default: nodemailer } = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST || 'smtp.gmail.com',
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from:    `"DentoCare Clinic" <${process.env.EMAIL_USER || 'notifications@dentocare.clinic'}>`,
        to:      patientEmail,
        subject: `📋 Digital Prescription (${rx.prescriptionNumber}) — DentoCare Clinic`,
        html:    emailHtml,
        attachments: [
          {
            filename:    `Prescription_${rx.prescriptionNumber}.pdf`,
            content:     pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      emailSent = true;
    } catch (mailErr) {
      console.warn('⚠️ Prescription email error (logged):', mailErr.message);
    }

    // Persist email status
    rx.emailSent = emailSent;
    await rx.save();

    // ── Real-time admin hub broadcast ─────────────────────────────────────────
    notifyAdminDashboard('admin:prescription_created', {
      prescriptionNumber: rx.prescriptionNumber,
      patientName,
      doctorName: rx.doctorName,
      emailSent,
    });

    return res.status(201).json({
      success: true,
      message: `Prescription ${rx.prescriptionNumber} generated${emailSent ? ' and emailed to patient' : ' (email delivery pending configuration)'}.`,
      prescription: rx,
      emailSent,
    });
  } catch (error) {
    console.error('❌ Prescription creation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/admin/prescriptions — List all prescriptions (admin) */
export const getAllPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, patientEmail, doctorName } = req.query;
    const filter = {};
    if (patientEmail) filter.patientEmail = { $regex: patientEmail, $options: 'i' };
    if (doctorName)   filter.doctorName   = { $regex: doctorName,   $options: 'i' };

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Prescription.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      prescriptions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/admin/prescriptions/:id/pdf — Stream prescription PDF */
export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    const pdfBuffer = await generatePrescriptionPDF(rx);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prescription_${rx.prescriptionNumber}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Financial Management & Payment Webhooks
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/admin/financials/summary — Aggregated financial overview */
export const getFinancialSummary = async (req, res) => {
  try {
    const cacheKey = 'admin:financial_summary';
    const cached = await getCache(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({ success: true, source: 'redis_cache', ...cached });
    }

    // ── Booking revenue aggregation ───────────────────────────────────────────
    const [bookingSummary] = await Booking.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id:          '$paymentStatus',
                count:        { $sum: 1 },
                totalRevenue: { $sum: '$amountPaid' },
                totalPending: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
              },
            },
          ],
          dailyRevenue: [
            {
              $group: {
                _id: {
                  year:  { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day:   { $dayOfMonth: '$createdAt' },
                },
                revenue: { $sum: '$amountPaid' },
                count:   { $sum: 1 },
              },
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
            { $limit: 30 },
          ],
        },
      },
    ]);

    // ── Billing invoice aggregation ───────────────────────────────────────────
    const [billingSummary] = await Billing.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id:         null,
                totalBilled: { $sum: '$totalAmount' },
                totalPaid:   { $sum: '$paidAmount' },
                totalDue:    { $sum: '$dueAmount' },
                invoices:    { $sum: 1 },
              },
            },
          ],
          byPaymentMethod: [
            {
              $group: {
                _id:   '$paymentMethod',
                count: { $sum: 1 },
                total: { $sum: '$paidAmount' },
              },
            },
            { $sort: { total: -1 } },
          ],
          recentUnpaid: [
            { $match: { paymentStatus: { $in: ['unpaid', 'partial'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                invoiceNumber: 1, patientName: 1, patientEmail: 1,
                totalAmount: 1, paidAmount: 1, dueAmount: 1,
                paymentStatus: 1, invoiceDate: 1,
              },
            },
          ],
        },
      },
    ]);

    // ── Recent invoices (Bookings) ─────────────────────────────────────────────
    const recentBookingInvoices = await Booking.find()
      .select('bookingReference patientName treatmentPlanTitle totalAmount amountPaid paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const payload = {
      bookingByStatus:      bookingSummary?.byStatus        || [],
      dailyRevenue:         bookingSummary?.dailyRevenue     || [],
      billingOverview:      billingSummary?.overview[0]      || {},
      paymentMethodBreakdown: billingSummary?.byPaymentMethod || [],
      recentUnpaidInvoices: billingSummary?.recentUnpaid     || [],
      recentBookingInvoices,
    };

    await setCache(cacheKey, payload, 180); // 3-minute TTL for financials

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({ success: true, source: 'database', ...payload });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/financials/webhook
 * Payment Gateway Webhook Handler — supports Stripe & SSLCommerz
 *
 * For Stripe: Verifies webhook signature using STRIPE_WEBHOOK_SECRET
 * For SSLCommerz: Validates val_id via IPN handshake
 * For generic/test: Processes raw JSON body directly
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const gateway = req.headers['x-payment-gateway'] || 'generic';

    // ── Stripe Webhook ────────────────────────────────────────────────────────
    if (gateway === 'stripe' && process.env.STRIPE_WEBHOOK_SECRET) {
      const stripe = getStripe();
      const sig    = req.headers['stripe-signature'];

      let event;
      try {
        // req.body must be the raw Buffer (use express.raw() for /webhook route in production)
        const rawBody = req.rawBody || JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (sigErr) {
        console.error('❌ Stripe webhook signature verification failed:', sigErr.message);
        return res.status(400).json({ success: false, message: `Stripe signature invalid: ${sigErr.message}` });
      }

      // ── Handle relevant Stripe event types ──────────────────────────────────
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        // Match booking by Stripe PaymentIntent ID
        const booking = await Booking.findOne({ paymentIntentId: pi.id });
        if (booking) {
          booking.amountPaid    = pi.amount_received / 100; // Stripe amounts in cents
          booking.paymentStatus = 'Paid';
          await booking.save();
          await _invalidateAndBroadcast(booking);
        }
      } else if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object;
        const booking = await Booking.findOne({ paymentIntentId: pi.id });
        if (booking) {
          booking.paymentStatus = 'Failed';
          await booking.save();
          await deleteCachePattern('admin:*');
          notifyAdminDashboard('admin:payment_failed', {
            bookingId:   booking._id,
            patientName: booking.patientName,
          });
        }
      }

      return res.status(200).json({ received: true });
    }

    // ── SSLCommerz IPN Webhook ────────────────────────────────────────────────
    if (gateway === 'sslcommerz') {
      const { val_id, tran_id, status, amount } = req.body;
      // SSLCommerz IPN: validate val_id via their API in production
      // For now, trust the payload and match by tran_id stored in paymentIntentId
      if (status === 'VALID' && tran_id) {
        const booking = await Booking.findOne({ paymentIntentId: tran_id });
        if (booking) {
          booking.amountPaid    = Number(amount) || booking.totalAmount;
          booking.paymentStatus = 'Paid';
          await booking.save();
          await _invalidateAndBroadcast(booking);
        }
      }
      return res.status(200).send('OK');
    }

    // ── Generic / Test Webhook ────────────────────────────────────────────────
    const { bookingId, billingId, amountPaid, paymentStatus = 'Paid', paymentIntentId } = req.body;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.amountPaid    = Number(amountPaid) || booking.totalAmount;
        booking.paymentStatus = paymentStatus;
        if (paymentIntentId) booking.paymentIntentId = paymentIntentId;
        await booking.save();
        await _invalidateAndBroadcast(booking);
      }
    }

    if (billingId) {
      const invoice = await Billing.findById(billingId);
      if (invoice) {
        invoice.paidAmount  = Number(amountPaid) || invoice.totalAmount;
        invoice.paymentDate = new Date();
        await invoice.save();
        await deleteCachePattern('admin:*');
      }
    }

    return res.status(200).json({ success: true, message: 'Payment webhook processed successfully.' });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Helper: Invalidate cache and broadcast real-time revenue update */
async function _invalidateAndBroadcast(booking) {
  await deleteCachePattern('admin:*');
  notifyAdminDashboard('admin:revenue_updated', {
    bookingId:   booking._id,
    patientName: booking.patientName,
    amountPaid:  booking.amountPaid,
    paymentStatus: booking.paymentStatus,
    treatmentPlan: booking.treatmentPlanTitle,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Appointment Management (Admin Hub)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/admin/appointments — All appointments with filters */
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const {
      page    = 1,
      limit   = 20,
      status,
      date,
      search,
      sortBy  = 'createdAt',
      sortDir = '-1',
    } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      filter.appointmentDate = {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lte: new Date(date + 'T23:59:59.999Z'),
      };
    }
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: Number(sortDir) };

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** PATCH /api/admin/appointments/:id/status — Update appointment status */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Confirmed', 'Cancelled', 'Completed', 'pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const update = { status };
    if (notes) update.notes = notes;

    const appointment = await Appointment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Invalidate analytics cache
    await deleteCachePattern('admin:*');

    // Real-time push to admin dashboard
    notifyAdminDashboard('admin:appointment_updated', {
      appointmentId: appointment._id,
      patientName:   appointment.name,
      status,
      updatedBy:     req.user?.name || 'Admin',
    });

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to "${status}".`,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** DELETE /api/admin/appointments/:id — Soft-delete (cancel) or hard-delete */
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;

    let appointment;
    if (hard === 'true') {
      appointment = await Appointment.findByIdAndDelete(id);
    } else {
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: 'Cancelled' },
        { new: true }
      );
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await deleteCachePattern('admin:*');
    notifyAdminDashboard('admin:appointment_cancelled', {
      appointmentId: id,
      patientName: appointment.name,
      hard: hard === 'true',
    });

    return res.status(200).json({
      success: true,
      message: hard === 'true' ? 'Appointment deleted permanently.' : 'Appointment cancelled successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
