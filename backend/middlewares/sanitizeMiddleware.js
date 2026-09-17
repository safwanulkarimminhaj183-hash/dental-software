// backend/middlewares/sanitizeMiddleware.js
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Build and return the array of security middlewares to mount globally.
 *
 * Layers applied (in order):
 * 1. helmet       — sets security HTTP headers (CSP, HSTS, X-Frame-Options, …)
 * 2. cors         — restricts cross-origin requests to configured origins
 * 3. mongoSanitize — strips $ and . from req.body / req.query / req.params
 *                    to block NoSQL injection attacks
 * 4. xss-clean    — sanitises HTML entities in request body to prevent XSS
 */

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : defaultOrigins;

export const securityMiddlewares = [
  // ── HTTP security headers ──────────────────────────────────────────────────
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'http://localhost:5000', 'http://127.0.0.1:5000', 'ws:', 'wss:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    // CRITICAL: Allow React frontend to fetch and render WebP dental images from /uploads
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),

  // ── CORS ───────────────────────────────────────────────────────────────────
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (same-origin, Postman, mobile apps)
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isAllowed) return callback(null, true);
      callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  }),

  // ── NoSQL injection prevention ─────────────────────────────────────────────
  mongoSanitize({
    replaceWith: '_', // replace $ / . with _ instead of removing entirely
    allowDots: false,
    onSanitize: ({ req, key }) => {
      console.warn(`[SECURITY] MongoDB sanitization triggered on key "${key}" — IP: ${req.ip}`);
    },
  }),

  // ── XSS prevention ────────────────────────────────────────────────────────
  xss(),
];
