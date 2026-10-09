import mongoose from 'mongoose';

/**
 * User / Staff Model
 * Roles:
 *   - super_admin : Full system access + revenue, user management
 *   - admin       : Dashboard analytics, schedule, prescriptions
 *   - doctor      : Prescriptions, patient records, schedule view
 *   - receptionist: Appointments, patient contact management
 *   - patient     : Self-service portal only (no admin access)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'],
      default: 'receptionist',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    specialization: {
      type: String,
      default: '',   // For doctors: e.g. "Orthodontics"
      trim: true,
    },
    licenseNumber: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full role label for display
userSchema.virtual('roleLabel').get(function () {
  const labels = {
    super_admin: 'Super Administrator',
    admin: 'Admin',
    doctor: 'Doctor / Dentist',
    receptionist: 'Receptionist',
    patient: 'Patient',
  };
  return labels[this.role] || this.role;
});

// Compound index for fast role-based lookup
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;
