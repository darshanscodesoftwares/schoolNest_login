const bcrypt = require('bcrypt');
const authRepository = require('../repositories/auth.repository');
const { generateToken } = require('../utils/jwt');

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Object} { token, user }
 * @throws {Error} with statusCode 401 if auth fails
 */
const login = async ({ email, password }) => {
  // Fetch user by email
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'AUTH_FAILED';
    throw error;
  }

  // Validate password using bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'AUTH_FAILED';
    throw error;
  }

  // Generate JWT with snake_case payload (matches academic-service middleware)
  const token = generateToken({
    user_id: user.id,
    role: user.role,        // 'ADMIN' | 'TEACHER' | 'PARENT'
    school_id: user.school_id
  });

  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      school_id: user.school_id
    }
  };
};

module.exports = { login };
