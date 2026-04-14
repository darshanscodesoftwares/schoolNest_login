const jwt = require('jsonwebtoken');
const authDbPool = require('../config/authDb');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }

    // Step 1: Verify JWT signature and expiry
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || 'your_super_secret_key';
      decoded = jwt.verify(authHeader.split(' ')[1], secret);
    } catch (err) {
      console.error('JWT verification failed:', err.message, 'Secret:', process.env.JWT_SECRET ? 'loaded' : 'NOT loaded');
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }

    // Step 2: Check if this token has been blacklisted (user logged out)
    try {
      const check = await authDbPool.query(
        `SELECT 1 FROM token_blacklist WHERE user_id = $1 AND issued_at = $2 LIMIT 1`,
        [decoded.user_id, decoded.iat]
      );

      if (check.rowCount > 0) {
        return res.status(401).json({ message: 'Unauthorized: Token has been revoked' });
      }
    } catch (dbError) {
      // Silent fail - token_blacklist table may not exist in all environments
      // Continue anyway - don't fail if blacklist check fails
    }

    req.user = decoded;
    return next();
  } catch (error) {
    console.error('auth.middleware error:', error.message, error.stack);
    return res.status(503).json({ message: 'Service temporarily unavailable: ' + error.message });
  }
};

// Named export for admin-only routes
const validateAdminRole = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }
    return next();
  });
};

module.exports = authMiddleware;
module.exports.validateAdminRole = validateAdminRole;
