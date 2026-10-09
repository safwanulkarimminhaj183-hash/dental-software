import UserActivity from '../models/UserActivity.js';
import logger from '../utils/logger.js';

/**
 * User Activity Tracking Middleware
 * Logs user actions for analytics and recommendation systems
 */
export const trackActivity = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Only track successful requests
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const activityData = {
          userId: req.user?._id || null,
          email: req.user?.email || req.body?.email || null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          action: action,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body),
          },
        };

        // Log activity asynchronously (don't block response)
        UserActivity.create(activityData).catch((err) => {
          logger.error('Failed to track user activity:', err);
        });

        // Log to Winston
        logger.info('User Activity', {
          action,
          email: activityData.email,
          ipAddress: activityData.ipAddress,
          path: req.path,
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Sanitize body for logging (remove sensitive data)
 */
function sanitizeBody(body) {
  if (!body) return {};

  const sensitiveFields = ['password', 'token', 'creditCard', 'ssn'];
  const sanitized = { ...body };

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}
