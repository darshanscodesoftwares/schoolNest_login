const express = require('express');
const { login, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Login with email and password
 * Returns JWT token with user details
 */
router.post('/login', login);

/**
 * POST /api/v1/auth/logout
 * Invalidate the current JWT token (requires valid Bearer token)
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;
