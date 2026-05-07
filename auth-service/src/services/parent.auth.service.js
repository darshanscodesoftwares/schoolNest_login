const authRepository = require('../repositories/auth.repository');
const { generateToken } = require('../utils/jwt');

// In-memory OTP storage (shared pattern with teacher OTP)
// In production, replace with Redis for distributed/stateless setup
const otpStore = new Map();

const generateOTP = () => '1234'; // Static for dev — swap for random in production

const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return '****';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

/**
 * Send OTP to parent's phone (the phone given during child's admission)
 * Flow:
 * 1. Find parent by phone in parent_guardian_information
 * 2. Generate OTP and store in memory
 * 3. Return session ID + children count
 */
const sendOTP = async ({ phone }) => {
  try {
    const parents = await authRepository.findParentsByPhone(phone);

    if (!parents || parents.length === 0) {
      var error = new Error('Phone number not registered. Please contact school admin');
      error.statusCode = 404;
      error.code = 'PHONE_NOT_FOUND';
      throw error;
    }

    // Use first match (same parent across multiple admissions deduped by email)
    var parent = parents[0];

    var otp = generateOTP();
    var otp_session_id = 'otp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    var expires_at = Date.now() + (5 * 60 * 1000); // 5 minutes

    otpStore.set(otp_session_id, {
      otp: otp,
      phone: phone,
      school_id: parent.school_id,
      parent_id: parent.id,
      parent_name: parent.name,
      parent_email: parent.email,
      children_count: parent.children_count,
      expires_at: expires_at
    });

    console.log('OTP sent to ' + maskPhone(phone) + ': ' + otp + ' (Session: ' + otp_session_id + ')');

    return {
      otp_session_id: otp_session_id,
      phone_masked: maskPhone(phone),
      expires_in: 300,
      children_count: parent.children_count,
      otp: otp // Dev only — remove in production
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw {
      message: err.message,
      statusCode: 500,
      code: 'SEND_OTP_ERROR'
    };
  }
};

/**
 * Verify OTP and generate JWT token
 * Flow:
 * 1. Validate OTP session exists and hasn't expired
 * 2. Verify OTP code matches
 * 3. Fetch parent auth user from auth_db
 * 4. Generate JWT with parent ID as user_id, role=PARENT
 */
const verifyOTP = async ({ otp_session_id, otp_code }) => {
  try {
    var otpData = otpStore.get(otp_session_id);

    if (!otpData) {
      var error = new Error('Invalid or expired OTP session');
      error.statusCode = 401;
      error.code = 'INVALID_OTP_SESSION';
      throw error;
    }

    if (Date.now() > otpData.expires_at) {
      otpStore.delete(otp_session_id);
      var error = new Error('OTP has expired. Please request a new OTP');
      error.statusCode = 401;
      error.code = 'OTP_EXPIRED';
      throw error;
    }

    if (otpData.otp !== otp_code) {
      var error = new Error('Invalid OTP code. Please try again');
      error.statusCode = 401;
      error.code = 'INVALID_OTP';
      throw error;
    }

    // Fetch parent from auth_db to confirm they still exist
    var parent = await authRepository.findParentById(otpData.parent_id, otpData.school_id);

    if (!parent) {
      var error = new Error('Parent account not found');
      error.statusCode = 404;
      error.code = 'PARENT_NOT_FOUND';
      throw error;
    }

    // Generate JWT — user_id = parent auth ID (e.g. PAR201 or UUID)
    var token = generateToken({
      user_id: parent.id,
      name: parent.name,
      role: 'PARENT',
      school_id: parent.school_id
    });

    otpStore.delete(otp_session_id);

    console.log('OTP verified for parent: ' + parent.name + ' (School: ' + parent.school_id + ')');

    return {
      token: token,
      user: {
        id: parent.id,
        name: otpData.parent_name,
        email: parent.email,
        phone: otpData.phone,
        role: 'PARENT',
        school_id: parent.school_id,
        children_count: otpData.children_count
      }
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw {
      message: err.message,
      statusCode: 500,
      code: 'VERIFY_OTP_ERROR'
    };
  }
};

/**
 * Resend OTP — reuses existing session if active, creates new one otherwise
 */
const resendOTP = async ({ phone }) => {
  try {
    var existingSessionId = null;
    var existingOtpData = null;

    for (var entry of otpStore.entries()) {
      var sessionId = entry[0];
      var data = entry[1];
      if (data.phone === phone) {
        if (Date.now() <= data.expires_at) {
          existingSessionId = sessionId;
          existingOtpData = data;
          break;
        } else {
          otpStore.delete(sessionId);
        }
      }
    }

    if (!existingSessionId) {
      return sendOTP({ phone: phone });
    }

    var otp = generateOTP();
    otpStore.set(existingSessionId, Object.assign({}, existingOtpData, {
      otp: otp,
      resent_at: Date.now()
    }));

    console.log('OTP resent to ' + maskPhone(phone) + ': ' + otp + ' (Session: ' + existingSessionId + ')');

    return {
      otp_session_id: existingSessionId,
      phone_masked: maskPhone(phone),
      expires_in: 300,
      children_count: existingOtpData.children_count,
      otp: otp // Dev only
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw {
      message: err.message,
      statusCode: 500,
      code: 'RESEND_OTP_ERROR'
    };
  }
};

module.exports = { sendOTP, verifyOTP, resendOTP };
