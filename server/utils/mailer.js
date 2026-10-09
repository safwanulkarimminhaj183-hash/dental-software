import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Creates Nodemailer transporter using SMTP or Gmail credentials
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return null;
};

const transporter = createTransporter();

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.warn('⚠️ Nodemailer Transporter Notice:', error.message);
    } else {
      console.log('📧 Nodemailer Transporter is ready to send emails.');
    }
  });
} else {
  console.log('ℹ️ Nodemailer: EMAIL_USER / EMAIL_PASS not fully set. Outgoing emails will be logged only.');
}

/**
 * Send dual notification emails for Contact Form submissions
 */
export const sendContactEmails = async ({ name, email, phone, message, createdAt }) => {
  const clinicName = process.env.CLINIC_NAME || 'DentoCare Dental Clinic';
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const fromAddress = `"${clinicName}" <${process.env.EMAIL_USER || 'noreply@dentocare.com'}>`;

  if (!transporter || !process.env.EMAIL_USER) {
    console.log(`[Contact Mail Mock] Admin Notification -> ${adminEmail}`);
    console.log(`[Contact Mail Mock] User Confirmation -> ${email}`);
    return;
  }

  // 1. Admin Email
  const adminMailOptions = {
    from: fromAddress,
    to: adminEmail,
    subject: `🚨 New Contact Inquiry: ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0284c7; padding: 20px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p><strong>Patient Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>Received At:</strong> ${new Date(createdAt || Date.now()).toLocaleString()}</p>
          <div style="margin-top: 15px; padding: 14px; background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 4px;">
            <strong>Message:</strong><br/>
            ${(message || '').replace(/\n/g, '<br/>')}
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          ${clinicName} &copy; ${new Date().getFullYear()} — Website Management
        </div>
      </div>
    `,
  };

  // 2. User Confirmation Email
  const userMailOptions = {
    from: fromAddress,
    to: email,
    subject: `Thank you for contacting ${clinicName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0284c7; padding: 20px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0;">Thank You for Reaching Out!</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for contacting <strong>${clinicName}</strong>. We have successfully received your inquiry and our team is currently reviewing it.</p>
          <div style="margin: 20px 0; padding: 14px; background-color: #f0f9ff; border-radius: 6px; border: 1px solid #bae6fd;">
            <strong style="color: #0369a1;">Summary of your message:</strong>
            <p style="margin: 8px 0 0 0; color: #0c4a6e;">"${message}"</p>
          </div>
          <p>If you have an urgent dental emergency, please call us directly at <strong>${process.env.CLINIC_PHONE || '(512) 205-1826'}</strong>.</p>
          <p>Warm regards,<br/><strong>The ${clinicName} Team</strong></p>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          ${process.env.CLINIC_ADDRESS || '123 Dental Street, Suite 400'}
        </div>
      </div>
    `,
  };

  try {
    await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);
  } catch (err) {
    console.error('⚠️ Nodemailer delivery error (Contact):', err.message);
  }
};

/**
 * Send dual notification emails for Appointment Bookings
 */
export const sendAppointmentEmails = async ({
  name,
  email,
  phone,
  department,
  appointmentDate,
  appointmentTime,
  notes,
  status,
  createdAt,
}) => {
  const clinicName = process.env.CLINIC_NAME || 'DentoCare Dental Clinic';
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const fromAddress = `"${clinicName} Bookings" <${process.env.EMAIL_USER || 'noreply@dentocare.com'}>`;
  const formattedDate = new Date(appointmentDate).toDateString();

  if (!transporter || !process.env.EMAIL_USER) {
    console.log(`[Appointment Mail Mock] Admin Notification -> ${adminEmail}`);
    console.log(`[Appointment Mail Mock] User Confirmation -> ${email}`);
    return;
  }

  // 1. Admin Email
  const adminMailOptions = {
    from: fromAddress,
    to: adminEmail,
    subject: `📅 New Appointment Booking: ${name} (${department})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #059669; padding: 20px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0;">New Appointment Request</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; font-weight: bold; width: 140px;">Patient Name:</td><td>${name}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Department:</td><td><strong style="color:#059669;">${department}</strong></td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Date & Time:</td><td><strong>${formattedDate} at ${appointmentTime}</strong></td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Status:</td><td><span style="background:#fef3c7; color:#b45309; padding:3px 8px; border-radius:4px; font-weight:bold;">${status}</span></td></tr>
            ${notes ? `<tr><td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Notes:</td><td>${notes}</td></tr>` : ''}
          </table>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          Submitted at ${new Date(createdAt || Date.now()).toLocaleString()}
        </div>
      </div>
    `,
  };

  // 2. User Confirmation Email
  const userMailOptions = {
    from: fromAddress,
    to: email,
    subject: `Appointment Booking Confirmation - ${clinicName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #059669; padding: 20px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0;">Appointment Request Received</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for choosing <strong>${clinicName}</strong>. Your dental appointment request has been received and is being scheduled.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #15803d;">Your Appointment Details:</h4>
            <p style="margin: 4px 0;"><strong>Service / Department:</strong> ${department}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${appointmentTime}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color:#d97706; font-weight:bold;">${status}</span></p>
          </div>

          <p>Need to reschedule or have questions? Contact us at <strong>${process.env.CLINIC_PHONE || '(512) 205-1826'}</strong>.</p>
          <p>We look forward to taking care of your smile!</p>
          <p>Warm regards,<br/><strong>${clinicName} Staff</strong></p>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          ${process.env.CLINIC_ADDRESS || '123 Dental Street, Suite 400'}
        </div>
      </div>
    `,
  };

  try {
    await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);
  } catch (err) {
    console.error('⚠️ Nodemailer delivery error (Appointment):', err.message);
  }
};
