import mongoose from 'mongoose';

// Chat message sub-document
const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['doctor', 'patient', 'system'],
      required: true,
    },
    senderName: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'prescription', 'system'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: false }
);

const telemedicineSessionSchema = new mongoose.Schema(
  {
    // ─── Session Identity ─────────────────────────────────────────────────────────
    sessionId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ─── Participants ─────────────────────────────────────────────────────────────
    specialistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
      default: null,
    },
    specialistName: {
      type: String,
      required: [true, 'Specialist name is required'],
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    patientPhone: {
      type: String,
      default: '',
      trim: true,
    },

    // ─── Linked Records ───────────────────────────────────────────────────────────
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    patientRecordId: {
      type: String,
      default: '',
      trim: true,
    },

    // ─── Session Details ──────────────────────────────────────────────────────────
    consultationType: {
      type: String,
      enum: ['video_call', 'chat', 'phone_call'],
      default: 'chat',
    },
    status: {
      type: String,
      enum: ['scheduled', 'waiting', 'active', 'completed', 'cancelled', 'missed'],
      default: 'scheduled',
      lowercase: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },

    // ─── Chief Complaint ──────────────────────────────────────────────────────────
    chiefComplaint: {
      type: String,
      default: '',
      trim: true,
    },

    // ─── Chat History ─────────────────────────────────────────────────────────────
    messages: {
      type: [chatMessageSchema],
      default: [],
    },

    // ─── Clinical Notes (post-session) ───────────────────────────────────────────
    clinicalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    diagnosis: {
      type: String,
      default: '',
      trim: true,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },

    // ─── Meeting Link / Room ──────────────────────────────────────────────────────
    meetingLink: {
      type: String,
      default: '',
    },
    roomCode: {
      type: String,
      default: '',
    },

    // ─── Fee ──────────────────────────────────────────────────────────────────────
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate sessionId before first save
// Uses timestamp + random suffix — no DB query needed, avoids buffering timeout
telemedicineSessionSchema.pre('save', function () {
  if (!this.sessionId) {
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(10 + Math.random() * 90);
    this.sessionId = `TM-${ts}${rand}`;
  }
  // Auto-compute duration if session ended
  if (this.startedAt && this.endedAt) {
    this.durationMinutes = Math.round(
      (this.endedAt - this.startedAt) / 60000
    );
  }
});

// Indexes (sessionId এর ডুপ্লিকেট ইনডেক্স রিমুভ করা হয়েছে)
telemedicineSessionSchema.index({ specialistId: 1, status: 1 });
telemedicineSessionSchema.index({ patientEmail: 1, scheduledAt: -1 });

const TelemedicineSession = mongoose.model('TelemedicineSession', telemedicineSessionSchema);
export default TelemedicineSession;