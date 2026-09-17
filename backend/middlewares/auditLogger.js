// backend/middlewares/auditLogger.js
// HIPAA-aligned audit logging for sensitive EHR and billing operations.
// Every read/write on protected medical data is logged with full context.

/**
 * auditLogger(action) — factory that returns an Express middleware.
 *
 * @param {string} action  Human-readable description of the operation,
 *                         e.g. 'READ_EHR', 'UPDATE_PRESCRIPTION', 'INITIATE_PAYMENT'
 *
 * Usage:
 *   router.get('/:id/records', protect, auditLogger('READ_EHR'), getPatientRecords);
 */
export const auditLogger = (action) => (req, res, next) => {
  const startedAt = Date.now();

  // Capture the original res.json to intercept the outcome status code
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      method: req.method,
      url: req.originalUrl,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userId: req.user?._id?.toString() ?? 'UNAUTHENTICATED',
      userRole: req.user?.role ?? 'GUEST',
      patientId:
        req.params?.patientId ||
        req.params?.id ||
        req.body?.patientId ||
        req.query?.patientId ||
        'N/A',
      statusCode: res.statusCode,
      success: res.statusCode >= 200 && res.statusCode < 300,
      durationMs: Date.now() - startedAt,
    };

    // ── In production: ship to your SIEM / CloudWatch / ELK stack ────────────
    // E.g.:  auditLogStream.write(JSON.stringify(entry) + '\n');
    console.log(`[AUDIT] ${JSON.stringify(entry)}`);

    return originalJson(body);
  };

  next();
};
