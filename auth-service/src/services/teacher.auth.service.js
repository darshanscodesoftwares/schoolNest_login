const authRepository = require('../repositories/auth.repository');
const { generateToken } = require('../utils/jwt');

// In-memory OTP storage (for testing/dev)
// In production, replace with Redis for distributed/stateless setup
const otpStore = new Map();

/**
 * Generate OTP (static for testing)
 * @returns {string} OTP code
 */
const generateOTP = () => {
  return '1234';
};

/**
 * Normalize phone number by removing spaces, hyphens, country code
 * Examples: "+91 6384582060" → "6384582060", "91-6384582060" → "6384582060"
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number (10 digits)
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  // Remove spaces, hyphens, parentheses
  let normalized = phone.replace(/[\s\-()]/g, '');
  // Remove country code if present (assumes India +91)
  if (normalized.startsWith('+91')) {
    normalized = normalized.slice(3);
  } else if (normalized.startsWith('91') && normalized.length > 10) {
    normalized = normalized.slice(2);
  }
  return normalized;
};

/**
 * Mask phone number for display (e.g., 9876543210 → 987****3210)
 * @param {string} phone - Full phone number
 * @returns {string} Masked phone number
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return '****';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

/**
 * Send OTP to teacher's primary phone
 * Flow:
 * 1. Check if phone exists in ANY school (auto-discover school)
 * 2. Generate OTP and store in memory with expiry
 * 3. Return session ID for subsequent verify/resend calls
 *
 * @param {string} primary_phone - Teacher's phone number
 * @returns {Object} { otp_session_id, phone_masked, expires_in }
 */
const sendOTP = async ({ primary_phone }) => {
  try {
    // Step 0: Normalize phone number (remove spaces, country code, etc.)
    const normalized_phone = normalizePhone(primary_phone);

    if (!normalized_phone || normalized_phone.length !== 10) {
      const error = new Error('Invalid phone number. Please provide a valid 10-digit phone number');
      error.statusCode = 400;
      error.code = 'INVALID_PHONE_FORMAT';
      throw error;
    }

    // Step 1: Find teacher by phone (auto-discover school)
    const teachers = await authRepository.findTeachersByPhone(normalized_phone);

    if (!teachers || teachers.length === 0) {
      const error = new Error('Phone number not registered. Please contact school admin');
      error.statusCode = 404;
      error.code = 'PHONE_NOT_FOUND';
      throw error;
    }

    // Use first teacher record (handles edge case of same phone in multiple schools)
    const teacher = teachers[0];
    const school_id = teacher.school_id;

    // Step 2: Generate OTP and unique session ID
    const otp = generateOTP();
    const otp_session_id = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires_at = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Step 3: Store OTP session in memory
    otpStore.set(otp_session_id, {
      otp,
      primary_phone: normalized_phone,
      school_id,
      teacher_id: teacher.id,
      expires_at
    });

    console.log(`📱 OTP sent to ${maskPhone(primary_phone)}: ${otp} (Session: ${otp_session_id})`);

    return {
      otp_session_id,
      phone_masked: maskPhone(primary_phone),
      expires_in: 300, // seconds
      otp // For dev/testing only — remove in production
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
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
 * 3. Fetch full teacher record from academic_db
 * 4. Generate JWT with teacher UUID as user_id
 * 5. Clean up OTP session
 *
 * @param {string} otp_session_id - Session ID from sendOTP
 * @param {string} otp_code - OTP entered by teacher
 * @returns {Object} { token, user }
 */
const verifyOTP = async ({ otp_session_id, otp_code }) => {
  try {
    // Step 1: Check session exists
    const otpData = otpStore.get(otp_session_id);

    if (!otpData) {
      const error = new Error('Invalid or expired OTP session');
      error.statusCode = 401;
      error.code = 'INVALID_OTP_SESSION';
      throw error;
    }

    // Step 2: Check expiry
    if (Date.now() > otpData.expires_at) {
      otpStore.delete(otp_session_id);
      const error = new Error('OTP has expired. Please request a new OTP');
      error.statusCode = 401;
      error.code = 'OTP_EXPIRED';
      throw error;
    }

    // Step 3: Verify code
    if (otpData.otp !== otp_code) {
      const error = new Error('Invalid OTP code. Please try again');
      error.statusCode = 401;
      error.code = 'INVALID_OTP';
      throw error;
    }

    // Step 4: Fetch full teacher record (school_id from OTP session for tenant isolation)
    const school_id = otpData.school_id;
    const teacher = await authRepository.findTeacherById(otpData.teacher_id, school_id);

    if (!teacher) {
      const error = new Error('Teacher record not found');
      error.statusCode = 404;
      error.code = 'TEACHER_NOT_FOUND';
      throw error;
    }

    // Step 5: Generate JWT — user_id = teacher UUID (same as auth_db.users.id via Bridge 1)
    const token = generateToken({
      user_id: teacher.id,
      role: 'TEACHER',
      school_id: school_id
    });

    // Step 6: Clean up OTP session
    otpStore.delete(otp_session_id);

    console.log(`✅ OTP verified for teacher: ${teacher.first_name} (School: ${school_id})`);

    return {
      token,
      user: {
        id: teacher.id,
        first_name: teacher.first_name,
        primary_phone: teacher.primary_phone,
        role: 'TEACHER',
        school_id: school_id
      }
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'VERIFY_OTP_ERROR'
    };
  }
};

/**
 * Resend OTP to teacher's phone
 * If active session exists → generate new OTP (keep same session ID + expiry)
 * If no active session → create new session (same as sendOTP)
 *
 * @param {string} primary_phone - Teacher's phone number
 * @returns {Object} { otp_session_id, phone_masked, expires_in }
 */
const resendOTP = async ({ primary_phone }) => {
  try {
    // Step 0: Normalize phone number
    const normalized_phone = normalizePhone(primary_phone);

    if (!normalized_phone || normalized_phone.length !== 10) {
      const error = new Error('Invalid phone number. Please provide a valid 10-digit phone number');
      error.statusCode = 400;
      error.code = 'INVALID_PHONE_FORMAT';
      throw error;
    }

    // Look for existing active session for this phone
    let existingSessionId = null;
    let existingOtpData = null;

    for (const [sessionId, otpData] of otpStore.entries()) {
      if (otpData.primary_phone === normalized_phone) {
        if (Date.now() <= otpData.expires_at) {
          existingSessionId = sessionId;
          existingOtpData = otpData;
          break;
        } else {
          otpStore.delete(sessionId);
        }
      }
    }

    // No active session — create new (same as sendOTP)
    if (!existingSessionId) {
      return sendOTP({ primary_phone });
    }

    // Active session found — generate new OTP, keep same session ID and expiry
    const otp = generateOTP();

    otpStore.set(existingSessionId, {
      ...existingOtpData,
      otp,
      resent_at: Date.now()
    });

    console.log(`📱 OTP resent to ${maskPhone(primary_phone)}: ${otp} (Session: ${existingSessionId})`);

    return {
      otp_session_id: existingSessionId,
      phone_masked: maskPhone(primary_phone),
      expires_in: 300,
      otp // For dev/testing only
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'RESEND_OTP_ERROR'
    };
  }
};

module.exports = { sendOTP, verifyOTP, resendOTP };
