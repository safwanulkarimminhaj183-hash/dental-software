// backend/services/reminderService.js
// Cron-based background service that sends appointment reminders.
//
// Schedule:
//   — 24-hour reminder: runs every hour, finds appointments in the next 24–25 h
//     whose email reminder has not been sent yet.
//   — 2-hour reminder:  runs every 15 minutes, finds appointments in the next
//     2–3 h whose SMS reminder has not been sent yet.
//
// Both jobs update the `reminderSent` flags on the Appointment document after
// a successful dispatch so they are never sent twice.

import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import {
  sendEmail,
  sendSMS,
  buildReminderEmail,
  buildReminderSMS,
} from './notificationService.js';

// ── Helper: find upcoming appointments in a time window ──────────────────────
/**
 * @param {number} fromMs  Window start offset from now in milliseconds
 * @param {number} toMs    Window end offset from now in milliseconds
 * @param {'email'|'sms'}  reminderType  Which flag to check
 */
const findDueAppointments = (fromMs, toMs, reminderType) => {
  const now = Date.now();
  const windowStart = new Date(now + fromMs);
  const windowEnd = new Date(now + toMs);
  const flagKey = `reminderSent.${reminderType}`;

  return Appointment.find({
    slot: { $gte: windowStart, $lte: windowEnd },
    status: { $in: ['booked', 'confirmed'] },
    [flagKey]: false,
  })
    .populate('patientId', 'firstName lastName email phone')
    .populate('doctorId', 'name specialty')
    .lean();
};

// ── 24-hour email reminder job ────────────────────────────────────────────────
/**
 * Runs every hour at minute 0.
 * Sends an email to patients whose appointment is 24–25 hours away.
 */
const run24hEmailReminders = async () => {
  const HOURS_24 = 24 * 60 * 60 * 1000;
  const HOURS_25 = 25 * 60 * 60 * 1000;

  let appointments;
  try {
    appointments = await findDueAppointments(HOURS_24, HOURS_25, 'email');
  } catch (err) {
    console.error('[Reminder] DB query error (24h email):', err.message);
    return;
  }

  if (!appointments.length) return;

  console.log(`[Reminder] 24h email job — ${appointments.length} appointment(s) due.`);

  for (const appt of appointments) {
    const patient = appt.patientId;
    const doctor = appt.doctorId;

    if (!patient?.email) {
      console.warn(`[Reminder] Appointment ${appt._id}: patient has no email, skipping.`);
      continue;
    }

    try {
      const { subject, html } = buildReminderEmail(appt, patient, doctor);
      await sendEmail({ to: patient.email, subject, html });

      // Mark email reminder sent
      await Appointment.findByIdAndUpdate(appt._id, {
        'reminderSent.email': true,
      });

      console.log(`[Reminder] Email sent to ${patient.email} for appointment ${appt._id}`);
    } catch (err) {
      // Log but don't crash — failed reminder will be retried next run
      console.error(
        `[Reminder] Failed to send email for appointment ${appt._id}:`,
        err.message
      );
    }
  }
};

// ── 2-hour SMS reminder job ───────────────────────────────────────────────────
/**
 * Runs every 15 minutes.
 * Sends an SMS to patients whose appointment is 2–3 hours away.
 */
const run2hSmsReminders = async () => {
  const HOURS_2 = 2 * 60 * 60 * 1000;
  const HOURS_3 = 3 * 60 * 60 * 1000;

  let appointments;
  try {
    appointments = await findDueAppointments(HOURS_2, HOURS_3, 'sms');
  } catch (err) {
    console.error('[Reminder] DB query error (2h SMS):', err.message);
    return;
  }

  if (!appointments.length) return;

  console.log(`[Reminder] 2h SMS job — ${appointments.length} appointment(s) due.`);

  for (const appt of appointments) {
    const patient = appt.patientId;
    const doctor = appt.doctorId;

    if (!patient?.phone) {
      console.warn(`[Reminder] Appointment ${appt._id}: patient has no phone, skipping.`);
      continue;
    }

    try {
      const smsBody = buildReminderSMS(appt, patient, doctor);
      await sendSMS({ to: patient.phone, body: smsBody });

      await Appointment.findByIdAndUpdate(appt._id, {
        'reminderSent.sms': true,
      });

      console.log(`[Reminder] SMS sent to ${patient.phone} for appointment ${appt._id}`);
    } catch (err) {
      console.error(
        `[Reminder] Failed to send SMS for appointment ${appt._id}:`,
        err.message
      );
    }
  }
};

// ── Scheduler bootstrap ───────────────────────────────────────────────────────
/**
 * startReminderService()
 * Call this once from server.js after the DB connection is established.
 * Registers both cron jobs and runs an immediate pass on startup.
 */
export const startReminderService = () => {
  console.log('[Reminder] Starting appointment reminder service…');

  // 24-hour email reminder — every hour at :00
  cron.schedule('0 * * * *', async () => {
    console.log('[Reminder] Running 24h email reminder job…');
    await run24hEmailReminders();
  });

  // 2-hour SMS reminder — every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Reminder] Running 2h SMS reminder job…');
    await run2hSmsReminders();
  });

  // Run once immediately on startup to catch any missed reminders
  // (e.g. after a server restart)
  setImmediate(async () => {
    await run24hEmailReminders();
    await run2hSmsReminders();
  });

  console.log('[Reminder] Cron jobs registered: 24h email (every hour), 2h SMS (every 15 min).');
};
