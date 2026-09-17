import mongoose from 'mongoose';

/**
 * Doctor Schedule Control Schema
 * Stores dentist availability per day and time slot configuration.
 */
const timeSlotSchema = new mongoose.Schema({
  slotTime: { type: String, required: true }, // e.g. "09:00 AM", "10:30 AM"
  maxCapacity: { type: Number, default: 1 }, // Standard dental slot capacity = 1 patient
  isAvailable: { type: Boolean, default: true }
});

const scheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  dayOfWeek: { type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  slots: [timeSlotSchema],
  isDayOff: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure unique schedule per doctor per date
scheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export default mongoose.model('Schedule', scheduleSchema);
