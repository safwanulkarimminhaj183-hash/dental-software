import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `BK-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    treatmentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan',
      required: true,
    },
    treatmentPlanTitle: {
      type: String,
      required: true,
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
      trim: true,
      lowercase: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone number is required'],
      trim: true,
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: 1,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time slot is required'],
      trim: true,
    },
    doctorName: {
      type: String,
      default: 'Dr. Sarah Johnson (Chief Orthodontist)',
      trim: true,
    },
    doctorId: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Failed'],
      default: 'Pending',
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      default: 'Stripe',
      trim: true,
    },
    paymentIntentId: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ appointmentDate: 1, appointmentTime: 1, doctorName: 1 });
bookingSchema.index({ patientEmail: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
