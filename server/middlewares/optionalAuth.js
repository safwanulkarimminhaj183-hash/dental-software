import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';

/**
 * Optional Authentication Middleware
 * Identifies whether the request comes from a logged-in user (via JWT) or a guest visitor.
 * Never halts execution on unauthenticated users; instead, attaches context:
 *  - req.isGuest: boolean
 *  - req.user: User document | null
 *  - req.guestSessionId: string
 *  - req.userType: 'authenticated' | 'guest'
 */
export const optionalAuth = async (req, res, next) => {
  let token = null;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query?.token) {
    token = req.query.token;
  }

  // Attempt to decode JWT
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id || decoded._id).select('-password');
      
      if (user) {
        req.user = user;
        req.isGuest = false;
        req.userType = 'authenticated';
        return next();
      }
    } catch (err) {
      // Invalid or expired token — treat gracefully as guest
      // Do not block the request
    }
  }

  // Request is from a Guest Visitor
  req.user = null;
  req.isGuest = true;
  req.userType = 'guest';

  // Extract or generate a stable guest session identifier
  const clientProvidedSession = req.headers['x-guest-session-id'] || req.headers['x-session-id'];
  if (clientProvidedSession) {
    req.guestSessionId = clientProvidedSession;
  } else {
    // Generate deterministic fingerprint from IP and User-Agent
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'generic-client';
    req.guestSessionId = 'guest_' + crypto.createHash('md5').update(`${ip}-${ua}`).digest('hex').substring(0, 16);
  }

  next();
};

export default optionalAuth;
