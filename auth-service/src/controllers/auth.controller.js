const authService = require('../services/auth.service');

/**
 * Handle login request
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [];
      if (!email) error.details.push({ field: 'email', message: 'Email is required' });
      if (!password) error.details.push({ field: 'password', message: 'Password is required' });
      throw error;
    }

    // Call service layer
    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle logout request
 * POST /api/v1/auth/logout
 * Requires: Authorization: Bearer <token>
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, logout };
