// backend/middlewares/roleMiddleware.js

/**
 * authorize(...roles) — role-based access control gate.
 *
 * Must be used AFTER the `protect` middleware (which sets req.user).
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler);
 *   router.put('/staff-or-admin', protect, authorize('admin', 'staff'), handler);
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
    });
  }

  next();
};

/**
 * ownerOrAdmin — allows the resource owner (patient checking their own
 * records) OR any admin/staff to proceed.
 *
 * Expects the patient id to be available as req.params.id or req.params.patientId.
 */
export const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const targetId = (req.params.id || req.params.patientId || '').toString();
  const userId = req.user._id.toString();
  const isAdmin = ['admin', 'staff'].includes(req.user.role);

  if (!isAdmin && userId !== targetId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own records.',
    });
  }

  next();
};
