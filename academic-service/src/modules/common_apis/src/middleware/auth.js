const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * Verify JWT token from Authorization header
 * Extracts: admin_id, school_id, role from JWT payload
 * Attaches to req.user for use in controllers
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(
        res,
        'No token provided',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.TOKEN_INVALID
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate required fields for multi-admin support
    if (!decoded.admin_id || !decoded.school_id) {
      return sendError(
        res,
        'Invalid token payload - missing admin_id or school_id',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.TOKEN_INVALID
      );
    }

    // Attach user info to request
    req.user = {
      admin_id: decoded.admin_id,
      school_id: decoded.school_id,
      role: decoded.role || 'ADMIN',
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(
        res,
        'Token has expired',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.TOKEN_EXPIRED
      );
    }

    sendError(
      res,
      'Invalid token',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.TOKEN_INVALID
    );
  }
};

/**
 * Optional: Verify token but don't require it
 * Useful for public endpoints
 */
const verifyTokenOptional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      admin_id: decoded.admin_id,
      school_id: decoded.school_id,
      role: decoded.role || 'ADMIN',
      email: decoded.email
    };
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Check if user has specific role
 * Usage: app.use(verifyToken, checkRole('ADMIN'))
 */
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return sendError(
        res,
        `Access denied. Required role: ${requiredRole}`,
        HTTP_STATUS.FORBIDDEN,
        'FORBIDDEN_001'
      );
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyTokenOptional,
  checkRole
};
