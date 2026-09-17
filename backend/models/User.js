// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'patient'],
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Virtual password setter — hashes on assignment ──────────────────────────
UserSchema.virtual('password').set(function (pwd) {
  this.passwordHash = bcrypt.hashSync(pwd, SALT_ROUNDS);
});

// ── Instance method: compare plaintext password against stored hash ──────────
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// ── Static: find active user by email (includes passwordHash for auth) ───────
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select('+passwordHash');
};

export default mongoose.model('User', UserSchema);
