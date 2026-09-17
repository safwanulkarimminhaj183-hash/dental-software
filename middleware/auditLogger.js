/**
 * HIPAA Compliance Audit Logging Middleware
 * Records all read/write/delete operations on sensitive Electronic Health Records (EHR).
 */
export const auditLogger = (actionDescription) => {
  return (req, res, next) => {
    const originalSend = res.send;

    // Capture execution details
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: req.user ? req.user.id : 'UNAUTHENTICATED',
      userRole: req.user ? req.user.role : 'GUEST',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      method: req.method,
      url: req.originalUrl,
      action: actionDescription,
      patientId: req.params.patientId || req.body.patientId || req.query.patientId || 'N/A'
    };

    // Override res.send to capture outcome status code
    res.send = function (body) {
      auditEntry.statusCode = res.statusCode;
      auditEntry.success = res.statusCode >= 200 && res.statusCode < 300;
      
      // In production, emit to encrypted audit log repository / SIEM / CloudWatch
      console.log(`[HIPAA AUDIT LOG] ${JSON.stringify(auditEntry)}`);
      
      return originalSend.apply(res, arguments);
    };

    next();
  };
};
