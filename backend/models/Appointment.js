// backend/models/Appointment.js
import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    // Exact UTC datetime of the appointment slot
    slot: {
      type: Date,
      required: [true, 'Appointment slot datetime is required'],
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'booked',
    },
    // Reason or chief complaint provided by the patient
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    notes: {
      // Internal staff notes added after the appointment
      type: String,
      trim: true,
    },
    // Reminder tracking
    reminderSent: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'staff', 'system'],
    },
    cancellationReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Prevent double-booking the exact same doctor slot (only when status is 'booked' or 'confirmed')
AppointmentSchema.index(
  { doctorId: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['booked', 'confirmed'] } },
  }
);
// Fast lookup by patient
AppointmentSchema.index({ patientId: 1, slot: -1 });
// For reminder cron: find upcoming booked appointments
AppointmentSchema.index({ slot: 1, status: 1, 'reminderSent.email': 1 });

export default mongoose.model('Appointment', AppointmentSchema);
