// backend/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

// ── Helper to build a limiter with shared defaults ───────────────────────────
const makeLimiter = (options) =>
  rateLimit({
    standardHeaders: true,   // RateLimit-* headers in responses
    legacyHeaders: false,    // disable X-RateLimit-* legacy headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: options.message || 'Too many requests. Please try again later.',
      });
    },
    ...options,
  });

/**
 * globalLimiter — broad cap applied to every route.
 * 200 requests per 15 minutes per IP.
 */
export const globalLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
});

/**
 * authLimiter — stricter cap for login / register endpoints to slow
 * brute-force attacks.
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

/**
 * supportLimiter — prevents ticket-spam on the Patient Help form.
 * 5 submissions per 10 minutes per IP.
 */
export const supportLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many support submissions. Please wait 10 minutes before trying again.',
});

/**
 * paymentLimiter — extra caution on payment initiation endpoints.
 * 10 attempts per 15 minutes per IP.
 */
export const paymentLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many payment attempts. Please try again after 15 minutes.',
});
