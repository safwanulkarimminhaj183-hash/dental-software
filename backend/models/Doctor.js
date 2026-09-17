// backend/models/Doctor.js
import mongoose from 'mongoose';

// ── Sub-schema: a single bookable time slot within a day ────────────────────
const SlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, 'Slot time must be in HH:MM format (e.g. "09:00")'],
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    isBlocked: {
      // admin can block individual slots (holiday, emergency)
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// ── Sub-schema: one day's availability schedule ─────────────────────────────
const AvailabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    slots: [SlotSchema],
  },
  { _id: false }
);

// ── Main Doctor schema ───────────────────────────────────────────────────────
const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    qualifications: [{ type: String, trim: true }],
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    photoUrl: { type: String },
    availability: [AvailabilitySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', DoctorSchema);
