// backend/middlewares/errorHandler.js

/**
 * notFound — 404 handler for unmatched routes.
 * Mount AFTER all routers.
 */
export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * errorHandler — centralised Express error middleware.
 * Must have exactly 4 parameters so Express recognises it as an error handler.
 *
 * Normalises:
 *  - Mongoose ValidationError  → 400
 *  - Mongoose CastError        → 400
 *  - Duplicate key (code 11000) → 409
 *  - JWT errors                → 401
 *  - Everything else           → 500 (or err.statusCode if set)
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose ValidationError ───────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed.';
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── MongoDB duplicate key ──────────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists.`;
  }

  // ── JWT errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  }

  // ── CORS error from sanitizeMiddleware ────────────────────────────────────
  if (err.message && err.message.startsWith('CORS policy:')) {
    statusCode = 403;
  }

  // Never leak stack traces in production
  const isDev = process.env.NODE_ENV === 'development';

  const body = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(isDev && { stack: err.stack }),
  };

  // Log server errors (5xx) always; client errors (4xx) in dev only
  if (statusCode >= 500) {
    console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl}`, err);
  } else if (isDev) {
    console.warn(`[WARN ${statusCode}] ${req.method} ${req.originalUrl} — ${message}`);
  }

  res.status(statusCode).json(body);
};
