// backend/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_in_prod';

/**
 * protect — verifies the JWT in the Authorization header and attaches
 * the authenticated user to req.user.
 *
 * Header format:  Authorization: Bearer <token>
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired — please log in again.'
        : 'Not authorized — invalid token.';
    return res.status(401).json({ success: false, message });
  }

  // Fetch fresh user on every request (detects deactivated accounts)
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — account not found or disabled.',
    });
  }

  req.user = user;
  next();
});

/**
 * optionalAuth — same as protect but does NOT block unauthenticated
 * requests. Used on the Patient Help form endpoint so guests can submit
 * tickets without logging in, while still attaching req.user when a
 * valid token is present.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(); // guest — proceed without req.user

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user && user.isActive) req.user = user;
  } catch {
    // Invalid/expired token — treat as guest, do not error
  }
  next();
});

/**
 * generateToken — signs a JWT for a given user id.
 * @param {string} id  - User or Patient ObjectId
 * @param {string} role - user role
 * @returns {string} signed JWT
 */
export const generateToken = (id, role) =>
  jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
