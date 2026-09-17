// backend/controllers/authController.js
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { generateToken } from '../middlewares/authMiddleware.js';

// ── Helper: build safe user payload (no passwordHash) ───────────────────────
const sanitizeUser = (doc) => ({
  _id: doc._id,
  name: doc.name || `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim(),
  email: doc.email,
  role: doc.role,
  phone: doc.phone,
  createdAt: doc.createdAt,
});

/**
 * @desc   Register a new patient account
 * @route  POST /api/auth/register
 * @access Public
 */
export const registerPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, dob, gender } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'firstName, lastName, email and password are required.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters.',
    });
  }

  // Check for existing account across both Patient and User collections
  const exists = await Patient.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const patient = new Patient({ firstName, lastName, email, phone, dob, gender });
  patient.password = password; // triggers bcrypt virtual setter
  await patient.save();

  // Also create a User record for unified auth (role: 'patient')
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (!userExists) {
    const user = new User({ name: `${firstName} ${lastName}`, email, phone, role: 'patient' });
    user.password = password;
    await user.save();
  }

  const token = generateToken(patient._id, 'patient');

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    token,
    user: sanitizeUser(patient),
  });
});

/**
 * @desc   Login (patient or staff/admin)
 * @route  POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // Try User (admin/staff) first, then Patient
  let account = await User.findByEmail(email);
  let role = account?.role;

  if (!account) {
    account = await Patient.findByEmail(email);
    role = 'patient';
  }

  if (!account) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Update last login timestamp (fire-and-forget)
  account.lastLogin = new Date();
  account.save().catch(() => {}); // non-blocking

  const token = generateToken(account._id, role);

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: sanitizeUser(account),
  });
});

/**
 * @desc   Get the currently authenticated user's profile
 * @route  GET /api/auth/me
 * @access Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

/**
 * @desc   Change password for authenticated user
 * @route  PUT /api/auth/change-password
 * @access Protected
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
  }

  // Fetch with passwordHash (normally hidden by select: false)
  const account = await User.findById(req.user._id).select('+passwordHash')
    || await Patient.findById(req.user._id).select('+passwordHash');

  if (!account) {
    return res.status(404).json({ success: false, message: 'Account not found.' });
  }

  const isMatch = await account.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  account.password = newPassword; // triggers bcrypt virtual
  await account.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});
