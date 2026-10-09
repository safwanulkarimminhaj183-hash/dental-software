import { Queue } from 'bullmq';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import redisClient, { isRedisAvailable } from './redisClient.js';

dotenv.config();

const QUEUE_NAME = 'treatment-notifications';
let notificationQueue = null;

// Initialize BullMQ Queue if Redis is present
try {
  if (process.env.REDIS_URL || isRedisAvailable()) {
    const connection = redisClient || { host: '127.0.0.1', port: 6379 };
    notificationQueue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
    console.log(`📬 [BullMQ] Notification Queue "${QUEUE_NAME}" initialized.`);
  }
} catch (err) {
  console.warn('⚠️ [BullMQ] Queue initialization fallback to direct email dispatch:', err.message);
}

// Nodemailer transport setup
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Return test/ethereal or console transport fallback for development
  return {
    sendMail: async (mailOptions) => {
      console.log('✉️ [Email System Mock/Dev Output]:');
      console.log(`   To: ${mailOptions.to}`);
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   Body Summary: ${mailOptions.text ? mailOptions.text.slice(0, 120) : 'HTML Content'}`);
      return { messageId: `mock-msg-${Date.now()}` };
    },
  };
};

export const directSendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"DentoCare Clinic" <notifications@dentocare.clinic>',
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    console.log(`✅ [Notification Direct] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ [Notification Direct] Email dispatch error:`, err.message);
    return false;
  }
};

/**
 * Add a notification job to BullMQ queue (or execute direct non-blocking fallback if BullMQ/Redis offline)
 */
export const addNotificationJob = async (jobName, data) => {
  try {
    if (notificationQueue && isRedisAvailable()) {
      const job = await notificationQueue.add(jobName, data);
      console.log(`🚀 [BullMQ Queue] Enqueued job "${jobName}" (#${job.id}) for ${data.patientEmail || data.email}`);
      return { queued: true, jobId: job.id };
    }
  } catch (err) {
    console.warn(`⚠️ [BullMQ Queue] Enqueue error, falling back to direct background process:`, err.message);
  }

  // Fallback: Non-blocking asynchronous execution via setImmediate
  setImmediate(async () => {
    console.log(`⚡ [Non-Blocking Fallback Worker] Processing job "${jobName}" directly...`);
    await processNotificationJob(jobName, data);
  });

  return { queued: false, status: 'dispatched_direct' };
};

/**
 * Core notification processor logic shared by BullMQ worker and fallback execution
 */
export const processNotificationJob = async (jobName, data) => {
  const { patientName, patientEmail, treatmentPlanTitle, appointmentDate, appointmentTime, bookingReference, totalAmount, amountPaid, enquiryMessage } = data;

  switch (jobName) {
    case 'booking_confirmation': {
      const subject = `🎉 Treatment Plan Booking Confirmation - Ref: ${bookingReference}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
          <h2 style="color: #0e2a47; margin-bottom: 5px;">DentoCare Clinic</h2>
          <h3 style="color: #3ec1d3; margin-top: 0;">Treatment Plan Reserved Successfully!</h3>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Thank you for choosing DentoCare. Your booking for <strong>${treatmentPlanTitle}</strong> has been confirmed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Booking Ref:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingReference}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Treatment Plan:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${treatmentPlanTitle}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Appointment Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(appointmentDate).toDateString()}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Time Slot:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${appointmentTime}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">$${amountPaid || 0} / $${totalAmount}</td></tr>
          </table>

          <p>If you have any questions or need to modify your schedule, please call us at <strong>512-205-1826</strong>.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">DentoCare Specialist Dental Practice | Professional Oral Healthcare</p>
        </div>
      `;
      return await directSendEmail({ to: patientEmail, subject, html });
    }

    case 'treatment_enquiry': {
      const subject = `📩 Enquiry Received for ${treatmentPlanTitle}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0e2a47;">Thank You for Your Enquiry!</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>We received your request regarding <strong>${treatmentPlanTitle}</strong>.</p>
          <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #3ec1d3; color: #334155;">
            "${enquiryMessage || 'Requested comprehensive treatment consultation'}"
          </blockquote>
          <p>Our dental advisor will contact you within 24 business hours with custom plan options and pricing guidance.</p>
        </div>
      `;
      return await directSendEmail({ to: patientEmail, subject, html });
    }

    case 'payment_receipt': {
      const subject = `💳 Payment Receipt - DentoCare Plan Booking (${bookingReference})`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0e2a47;">Payment Confirmation</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>We have successfully processed your payment of <strong>$${amountPaid}</strong> for your treatment plan <strong>${treatmentPlanTitle}</strong>.</p>
          <p>Your appointment is scheduled for <strong>${new Date(appointmentDate).toDateString()} at ${appointmentTime}</strong>.</p>
        </div>
      `;
      return await directSendEmail({ to: patientEmail, subject, html });
    }

    default:
      console.warn(`[BullMQ Worker] Unknown job type: ${jobName}`);
      return false;
  }
};

export default notificationQueue;
