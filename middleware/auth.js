import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dentist-secret-jwt-key-2026-secure';

/**
 * Authentication Middleware: Verifies Bearer JWT Token
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Missing or malformed token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, email, role (Patient, Dentist, Receptionist, Admin)
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Authorization Middleware: Enforces Role-Based Access Control (RBAC)
 * @param  {...string} roles - Allowed roles e.g. ('Dentist', 'Receptionist', 'Admin')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Action restricted to roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};
