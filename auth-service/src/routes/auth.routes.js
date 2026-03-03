const express = require('express');
const { login } = require('../controllers/auth.controller');

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Login with email and password
 * Returns JWT token with user details
 */
router.post('/login', login);

module.exports = router;
