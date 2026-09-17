import mongoose from 'mongoose';

/**
 * Appointment Booking Schema with Double-Booking Prevention
 */
const appointmentSchema = new mongoose.Schema({
  bookingReference: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => 'APT-' + Math.floor(100000 + Math.random() * 900000) 
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  slotTime: { type: String, required: true }, // Format: "09:00 AM"
  serviceType: { type: String, required: true }, // e.g., Root Canal, Scaling, Checkup
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
    default: 'Confirmed' 
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid'
  },
  lockTimestamp: { type: Date, default: Date.now }, // Pessimistic/Optimistic lock lock-in window
  reminderSent: { type: Boolean, default: false },
  reminder2hSent: { type: Boolean, default: false },
  patientNotes: { type: String }
}, { timestamps: true });

/**
 * DATABASE-LEVEL DOUBLE BOOKING PREVENTION:
 * Compound unique index on doctorId + date + slotTime for active (non-cancelled) bookings.
 */
appointmentSchema.index(
  { doctorId: 1, date: 1, slotTime: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { status: { $ne: 'Cancelled' } } 
  }
);

export default mongoose.model('Appointment', appointmentSchema);
