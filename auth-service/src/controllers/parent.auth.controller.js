var parentAuthService = require('../services/parent.auth.service');

/**
 * POST /api/v1/auth/parent/send-otp
 * Send OTP to parent's phone (from admission records)
 */
var sendOTP = async function (req, res, next) {
  try {
    var phone = req.body.phone;

    if (!phone) {
      var error = new Error('Phone number is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'phone', message: 'Phone number is required' }];
      throw error;
    }

    var result = await parentAuthService.sendOTP({ phone: phone });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp_session_id: result.otp_session_id,
      phone_masked: result.phone_masked,
      expires_in: result.expires_in,
      children_count: result.children_count
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/parent/verify-otp
 * Verify OTP and return JWT token
 */
var verifyOTP = async function (req, res, next) {
  try {
    var otp_session_id = req.body.otp_session_id;
    var otp_code = req.body.otp_code;

    if (!otp_session_id || !otp_code) {
      var error = new Error('OTP session ID and OTP code are required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [];
      if (!otp_session_id) error.details.push({ field: 'otp_session_id', message: 'OTP session ID is required' });
      if (!otp_code) error.details.push({ field: 'otp_code', message: 'OTP code is required' });
      throw error;
    }

    var result = await parentAuthService.verifyOTP({ otp_session_id: otp_session_id, otp_code: otp_code });

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
 * POST /api/v1/auth/parent/resend-otp
 * Resend OTP — reuses existing session if active
 */
var resendOTP = async function (req, res, next) {
  try {
    var phone = req.body.phone;

    if (!phone) {
      var error = new Error('Phone number is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'phone', message: 'Phone number is required' }];
      throw error;
    }

    var result = await parentAuthService.resendOTP({ phone: phone });

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      otp_session_id: result.otp_session_id,
      phone_masked: result.phone_masked,
      expires_in: result.expires_in,
      children_count: result.children_count
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { sendOTP: sendOTP, verifyOTP: verifyOTP, resendOTP: resendOTP };
