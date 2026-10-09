import mongoose from 'mongoose';

const timeSlotOverrideSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  isBlocked: { type: Boolean, default: true },
  reason: { type: String, default: 'Blocked by Admin/Doctor' },
}, { _id: true });

const scheduleSchema = new mongoose.Schema(
  {
    doctorName: {
      type: String,
      required: true,
      default: 'Dr. Sarah Johnson (Chief Orthodontist)',
      trim: true,
    },
    doctorId: {
      type: String,
      default: null,
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    workingHours: {
      startTime: { type: String, default: '09:00 AM' },
      endTime: { type: String, default: '06:00 PM' },
    },
    breakHours: {
      breakStart: { type: String, default: '01:00 PM' },
      breakEnd: { type: String, default: '02:00 PM' },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: 15,
      max: 120,
    },
    offDates: {
      type: [Date],
      default: [],
    },
    slotOverrides: {
      type: [timeSlotOverrideSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ doctorName: 1, isActive: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
