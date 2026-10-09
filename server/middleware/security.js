import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

/**
 * Global rate limiter for general API routes
 * 100 requests per 15 minutes window
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for Booking and Payment endpoints to prevent bot spam and brute force
 * 10 requests per 15 minutes
 */
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Booking request limit exceeded for this IP. Please wait before submitting another booking.',
  },
});

/**
 * Express 5 compatible Data Sanitization middleware against NoSQL Injection ($ and . stripping)
 * Mutates objects in-place instead of reassigning req.query getter
 */
export const sanitizeData = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  if (req.query && typeof req.query === 'object') {
    mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  }
  next();
};

/**
 * Helmet Security Headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Allow inline script/style execution for dev and dynamic images
  crossOriginEmbedderPolicy: false,
});
