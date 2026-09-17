// backend/services/notificationService.js
// Thin adapters for email (Nodemailer) and SMS (Twilio stub).
// Swap the SMS block for the real Twilio SDK in production.

import nodemailer from 'nodemailer';

// ── Email transport ────────────────────────────────────────────────────────────
const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.EMAIL_USER || 'apikey',
      pass: process.env.EMAIL_PASS || '',
    },
  });

/**
 * sendEmail({ to, subject, html, text? })
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_PASS) {
    // In development, just log instead of failing
    console.log(`[Email - DEV] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@smiledental.com',
    to,
    subject,
    html,
    text: text || subject,
  });
  console.log(`[Email] Sent "${subject}" to ${to}`);
};

// ── SMS adapter ────────────────────────────────────────────────────────────────
/**
 * sendSMS({ to, body })
 * Production: replace with real Twilio SDK calls.
 * @returns {Promise<void>}
 */
export const sendSMS = async ({ to, body }) => {
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS - DEV] To: ${to} | Message: ${body}`);
    return;
  }

  // ── Uncomment for production Twilio integration ──────────────────────────
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   from: process.env.TWILIO_FROM_NUMBER,
  //   to,
  //   body,
  // });

  console.log(`[SMS] Sent to ${to}: ${body}`);
};

// ── Template builders ──────────────────────────────────────────────────────────

/**
 * buildReminderEmail(appointment, patient, doctor)
 * Returns { subject, html } for the appointment reminder email.
 */
export const buildReminderEmail = (appointment, patient, doctor) => {
  const dateStr = new Date(appointment.slot).toLocaleString('en-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });

  const subject = `Appointment Reminder — ${dateStr}`;
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const doctorName = doctor?.name || 'your dentist';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #f9f9f9; border-radius: 8px; overflow: hidden; }
    .header { background: #0077b6; color: white; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 28px 32px; }
    .detail-box { background: #fff; border-left: 4px solid #0077b6; padding: 16px 20px; margin: 20px 0; border-radius: 4px; }
    .detail-box p { margin: 6px 0; font-size: 15px; }
    .footer { background: #eee; text-align: center; padding: 16px; font-size: 12px; color: #777; }
    .btn { display: inline-block; background: #0077b6; color: white; padding: 12px 28px;
           text-decoration: none; border-radius: 5px; margin-top: 16px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦷 Smile Care Dental Clinic</h1>
      <p style="margin:4px 0 0; font-size:14px; opacity:0.85;">Appointment Reminder</p>
    </div>
    <div class="body">
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>This is a friendly reminder about your upcoming dental appointment:</p>
      <div class="detail-box">
        <p><strong>📅 Date &amp; Time:</strong> ${dateStr}</p>
        <p><strong>👨‍⚕️ Dentist:</strong> ${doctorName}</p>
        <p><strong>📋 Reason:</strong> ${appointment.reason || 'General consultation'}</p>
        <p><strong>🆔 Appointment ID:</strong> ${appointment._id}</p>
      </div>
      <p>Please arrive 10 minutes early. If you need to reschedule or cancel, contact us at least 24 hours in advance.</p>
      <p style="margin-top:24px;">
        📞 <strong>+880 1700-000000</strong><br>
        📧 <strong>help@smiledental.com</strong><br>
        📍 <strong>123 Healthcare Boulevard, Dhaka, Bangladesh</strong>
      </p>
      <p>Thank you for choosing Smile Care Dental Clinic. See you soon!</p>
    </div>
    <div class="footer">
      You received this email because you booked an appointment at Smile Care Dental Clinic.<br>
      Please do not reply to this email.
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
};

/**
 * buildReminderSMS(appointment, patient, doctor)
 * Returns a compact SMS string for the appointment reminder.
 */
export const buildReminderSMS = (appointment, patient, doctor) => {
  const dateStr = new Date(appointment.slot).toLocaleString('en-BD', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
  const doctorName = doctor?.name || 'your dentist';
  return `Reminder: You have a dental appointment with ${doctorName} on ${dateStr} at Smile Care Dental Clinic. Call +880 1700-000000 to reschedule.`;
};
