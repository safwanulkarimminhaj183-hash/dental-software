import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department / Service is required'],
      trim: true,
      default: 'General Dentistry',
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true,
    },
    doctorName: {
      type: String,
      default: 'General Dentist',
      trim: true,
    },
    doctorId: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Replied', 'Cancelled', 'Completed', 'pending', 'confirmed', 'cancelled'],
      default: 'Pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for compatibility with different frontend components
appointmentSchema.virtual('patientName').get(function () {
  return this.name;
});
appointmentSchema.virtual('patientEmail').get(function () {
  return this.email;
});
appointmentSchema.virtual('patientPhone').get(function () {
  return this.phone;
});
appointmentSchema.virtual('serviceName').get(function () {
  return this.department;
});
appointmentSchema.virtual('date').get(function () {
  return this.appointmentDate ? this.appointmentDate.toISOString().split('T')[0] : '';
});
appointmentSchema.virtual('time').get(function () {
  return this.appointmentTime;
});

// Indexes for query performance
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ email: 1, phone: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
