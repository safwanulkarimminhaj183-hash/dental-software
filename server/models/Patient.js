import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    isNewPatient: {
      type: Boolean,
      default: true,
    },
    medicalHistory: {
      type: String,
      default: '',
      trim: true,
    },
    allergies: {
      type: String,
      default: '',
      trim: true,
    },
    previousAppointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    registeredAt: {
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

patientSchema.index({ email: 1 });
patientSchema.index({ isNewPatient: 1 });

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;
