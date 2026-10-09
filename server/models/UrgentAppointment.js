import mongoose from 'mongoose';

const urgentAppointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Routine', 'Emergency'],
      default: 'Routine',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    symptomDescription: {
      type: String,
      default: '',
      trim: true,
    },
    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

urgentAppointmentSchema.index({ type: 1, status: 1 });
urgentAppointmentSchema.index({ date: 1 });

const UrgentAppointment =
  mongoose.models.UrgentAppointment ||
  mongoose.model('UrgentAppointment', urgentAppointmentSchema);

export default UrgentAppointment;
