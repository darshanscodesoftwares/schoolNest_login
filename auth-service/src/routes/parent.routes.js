var express = require('express');
var controller = require('../controllers/parent.auth.controller');

var router = express.Router();

// POST /api/v1/auth/parent/send-otp
router.post('/send-otp', controller.sendOTP);

// POST /api/v1/auth/parent/resend-otp
router.post('/resend-otp', controller.resendOTP);

// POST /api/v1/auth/parent/verify-otp
router.post('/verify-otp', controller.verifyOTP);

module.exports = router;
