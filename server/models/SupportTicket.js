import mongoose from 'mongoose';

const messageThreadSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['patient', 'admin', 'bot'],
      default: 'patient',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    // ── Ticket Identity ──────────────────────────────────────────
    ticketNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ── Sender Info ──────────────────────────────────────────────
    senderName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    senderEmail: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    senderPhone: {
      type: String,
      default: '',
      trim: true,
    },

    // ── Inquiry Details ──────────────────────────────────────────
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'appointment',
        'billing',
        'medical_records',
        'general',
        'emergency',
        'insurance',
        'feedback',
        'other',
      ],
      default: 'general',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },

    // ── Status & Priority ────────────────────────────────────────
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // ── Auto-reply tracking ──────────────────────────────────────
    autoReplySent: {
      type: Boolean,
      default: false,
    },
    autoReplyMessage: {
      type: String,
      default: '',
    },

    // ── Conversation thread ──────────────────────────────────────
    thread: {
      type: [messageThreadSchema],
      default: [],
    },

    // ── Admin notes ──────────────────────────────────────────────
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: String,
      default: 'Support Team',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate ticket number before first save
// Uses timestamp + random suffix — no DB query needed, avoids buffering timeout
supportTicketSchema.pre('save', function () {
  if (!this.ticketNumber) {
    const year = new Date().getFullYear();
    const ts = Date.now().toString().slice(-5);          // last 5 digits of epoch ms
    const rand = Math.floor(10 + Math.random() * 90);   // 2-digit random suffix
    this.ticketNumber = `TKT-${year}-${ts}${rand}`;
  }

  // Auto-set resolvedAt when status becomes resolved/closed
  if (
    (this.status === 'resolved' || this.status === 'closed') &&
    !this.resolvedAt
  ) {
    this.resolvedAt = new Date();
  }
});

// Indexes for admin dashboard queries
supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ senderEmail: 1 });
supportTicketSchema.index({ category: 1, priority: 1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
