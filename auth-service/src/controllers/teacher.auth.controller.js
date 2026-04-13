const teacherAuthService = require('../services/teacher.auth.service');

/**
 * POST /api/v1/auth/teacher/send-otp
 * Send OTP to teacher's primary phone
 * Backend auto-discovers school_id from phone number
 */
const sendOTP = async (req, res, next) => {
  try {
    const { primary_phone } = req.body;

    if (!primary_phone) {
      const error = new Error('Primary phone is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'primary_phone', message: 'Primary phone is required' }];
      throw error;
    }

    const result = await teacherAuthService.sendOTP({ primary_phone });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp_session_id: result.otp_session_id,
      phone_masked: result.phone_masked,
      expires_in: result.expires_in
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/teacher/verify-otp
 * Verify OTP and return JWT token
 * school_id is stored in OTP session — not required in request
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { otp_session_id, otp_code } = req.body;

    if (!otp_session_id || !otp_code) {
      const error = new Error('OTP session ID and OTP code are required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [];
      if (!otp_session_id) error.details.push({ field: 'otp_session_id', message: 'OTP session ID is required' });
      if (!otp_code) error.details.push({ field: 'otp_code', message: 'OTP code is required' });
      throw error;
    }

    const result = await teacherAuthService.verifyOTP({ otp_session_id, otp_code });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/teacher/resend-otp
 * Resend OTP — reuses existing session if active, creates new one otherwise
 */
const resendOTP = async (req, res, next) => {
  try {
    const { primary_phone } = req.body;

    if (!primary_phone) {
      const error = new Error('Primary phone is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'primary_phone', message: 'Primary phone is required' }];
      throw error;
    }

    const result = await teacherAuthService.resendOTP({ primary_phone });

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      otp_session_id: result.otp_session_id,
      phone_masked: result.phone_masked,
      expires_in: result.expires_in
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { sendOTP, verifyOTP, resendOTP };
