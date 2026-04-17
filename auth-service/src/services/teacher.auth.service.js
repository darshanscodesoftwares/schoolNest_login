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
 * Normalize phone number to standard format with country code
 * Converts both "6384582060" and "+91 6384582060" to "+91 6384582060"
 * @param {string} phone - Phone number (with or without +91)
 * @returns {string} Normalized phone number with +91 prefix
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove spaces, hyphens, and other special characters
  let cleaned = phone.replace(/[\s\-()]/g, '');

  // If it's a 10-digit number, prepend +91
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    return `+91${cleaned}`;
  }

  // If it already has +91, return as is
  if (cleaned.startsWith('+91')) {
    return cleaned;
  }

  // If it starts with 91 (without +), prepend +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // Return as is (it's already in some format)
  return cleaned;
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
 * 1. Normalize phone number (accept both "+91 6384582060" and "6384582060")
 * 2. Check if phone exists in ANY school (auto-discover school)
 * 3. Generate OTP and store in memory with expiry
 * 4. Return session ID for subsequent verify/resend calls
 *
 * @param {string} primary_phone - Teacher's phone number (with or without +91)
 * @returns {Object} { otp_session_id, phone_masked, expires_in }
 */
const sendOTP = async ({ primary_phone }) => {
  try {
    // Step 0: Normalize phone number (handles both "6384582060" and "+91 6384582060")
    const normalizedPhone = normalizePhoneNumber(primary_phone);

    // Step 1: Find teacher by phone (auto-discover school)
    const teachers = await authRepository.findTeachersByPhone(normalizedPhone);

    if (!teachers || teachers.length === 0) {
      const error = new Error('Phone number not registered. Please contact school admin');
      error.statusCode = 404;
      error.code = 'PHONE_NOT_FOUND';
      throw error;
    }

    // Use first teacher record (handles edge case of same phone in multiple schools)
    const teacher = teachers[0];
    const school_id = teacher.school_id;

    // Step 3: Generate OTP and unique session ID
    const otp = generateOTP();
    const otp_session_id = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires_at = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Step 4: Store OTP session in memory (use normalized phone)
    otpStore.set(otp_session_id, {
      otp,
      primary_phone: normalizedPhone,
      school_id,
      teacher_id: teacher.id,
      expires_at
    });

    console.log(`📱 OTP sent to ${maskPhone(normalizedPhone)}: ${otp} (Session: ${otp_session_id})`);

    return {
      otp_session_id,
      phone_masked: maskPhone(normalizedPhone),
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
 * @param {string} primary_phone - Teacher's phone number (with or without +91)
 * @returns {Object} { otp_session_id, phone_masked, expires_in }
 */
const resendOTP = async ({ primary_phone }) => {
  try {
    // Normalize phone number first
    const normalizedPhone = normalizePhoneNumber(primary_phone);

    // Look for existing active session for this phone
    let existingSessionId = null;
    let existingOtpData = null;

    for (const [sessionId, otpData] of otpStore.entries()) {
      if (otpData.primary_phone === normalizedPhone) {
        if (Date.now() <= otpData.expires_at) {
          existingSessionId = sessionId;
          existingOtpData = otpData;
          break;
        } else {
          otpStore.delete(sessionId);
        }
      }
    }

    // No active session — create new (same as sendOTP, use normalized phone)
    if (!existingSessionId) {
      return await sendOTP({ primary_phone: normalizedPhone });
    }

    // Active session found — generate new OTP, keep same session ID and expiry
    const otp = generateOTP();

    otpStore.set(existingSessionId, {
      ...existingOtpData,
      otp,
      resent_at: Date.now()
    });

    console.log(`📱 OTP resent to ${maskPhone(normalizedPhone)}: ${otp} (Session: ${existingSessionId})`);

    return {
      otp_session_id: existingSessionId,
      phone_masked: maskPhone(normalizedPhone),
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
