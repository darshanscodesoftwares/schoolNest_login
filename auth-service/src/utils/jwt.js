const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

/**
 * Generate JWT token
 * @param {Object} payload - Token payload (should contain user_id, role, school_id)
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env for production.');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
