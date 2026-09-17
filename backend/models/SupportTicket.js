// backend/models/SupportTicket.js
// Backs the "About Us → Patient Help" section.
// Each ticket is a thread of messages between a patient/guest and admin staff.
import mongoose from 'mongoose';

// ── Single message within a ticket thread ────────────────────────────────────
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['patient', 'admin', 'system'], // 'system' = auto-reply bot
      required: true,
    },
    senderName: { type: String, trim: true }, // display name (patient name or "Admin")
    text: {
      type: String,
      required: [true, 'Message text is required'],
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    isAutoReply: { type: Boolean, default: false },
    readByAdmin: { type: Boolean, default: false },
    readByPatient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Support ticket schema ────────────────────────────────────────────────────
const SupportTicketSchema = new mongoose.Schema(
  {
    // patientId is optional — guests submitting via "Patient Help" form
    // may not be registered yet
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    // Sender info for guests (not yet registered patients)
    guestName: { type: String, trim: true },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    guestPhone: { type: String, trim: true },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['general', 'appointment', 'billing', 'medical', 'technical', 'faq'],
      default: 'general',
    },
    messages: [MessageSchema],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    assignedTo: {
      // Admin/staff user handling this ticket
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: { type: Date },
    // Track which FAQ keywords triggered an auto-reply
    autoReplyTriggered: { type: Boolean, default: false },
    autoReplyKeyword: { type: String },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
SupportTicketSchema.index({ status: 1, createdAt: -1 }); // admin dashboard listing
SupportTicketSchema.index({ patientId: 1 });
SupportTicketSchema.index({ guestEmail: 1 });

// ── Virtual: total message count ─────────────────────────────────────────────
SupportTicketSchema.virtual('messageCount').get(function () {
  return this.messages.length;
});

export default mongoose.model('SupportTicket', SupportTicketSchema);
