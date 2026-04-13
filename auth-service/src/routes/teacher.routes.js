const express = require('express');
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/teacher.auth.controller');

const router = express.Router();

// POST /api/v1/auth/teacher/send-otp
router.post('/send-otp', sendOTP);

// POST /api/v1/auth/teacher/resend-otp
router.post('/resend-otp', resendOTP);

// POST /api/v1/auth/teacher/verify-otp
router.post('/verify-otp', verifyOTP);

module.exports = router;
