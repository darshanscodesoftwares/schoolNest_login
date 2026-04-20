const admissionsRepository = require('./admissions.repository');
const { validateClassExists } = require('../../../../utils/common-api.client');
const pool = require('../../../../config/db');
const authPool = require('../../../../config/auth-db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ─── Bridge 2: admission approved → create parent auth user + student record ──
const runBridge2 = async (schoolId, admissionId) => {
  try {
    // Fetch personal info (student name) and academic info (class, section, roll)
    const personalRes = await pool.query(
      `SELECT first_name, last_name FROM personal_information WHERE student_id = $1 AND school_id = $2 LIMIT 1`,
      [admissionId, schoolId]
    );
    const academicRes = await pool.query(
      `SELECT class_id, section, roll_number FROM academic_information WHERE student_id = $1 AND school_id = $2 LIMIT 1`,
      [admissionId, schoolId]
    );
    const parentRes = await pool.query(
      `SELECT father_full_name, father_email, mother_full_name, mother_email FROM parent_guardian_information WHERE student_id = $1 AND school_id = $2 LIMIT 1`,
      [admissionId, schoolId]
    );

    if (!personalRes.rows[0] || !academicRes.rows[0]) {
      console.warn(`Bridge 2: missing personal/academic info for admission ${admissionId}`);
      return;
    }

    const personal = personalRes.rows[0];
    const academic = academicRes.rows[0];
    const parent = parentRes.rows[0];

    const studentName = `${personal.first_name} ${personal.last_name}`.trim();

    // Resolve admin school_class → teacher/parent classes table
    // Find classes.id WHERE school_id AND name matches school_classes.class_name AND section matches
    const classRes = await pool.query(
      `SELECT c.id FROM classes c
       JOIN school_classes sc ON sc.class_name = c.name
       WHERE c.school_id = $1 AND sc.id = $2 AND c.section = $3
       LIMIT 1`,
      [schoolId, academic.class_id, academic.section]
    );

    const classId = (classRes.rows[0] && classRes.rows[0].id) || null;

    // ── Create parent in auth_db ────────────────────────────────────────────
    let parentAuthId = null;
    const parentEmail = (parent && parent.father_email) || (parent && parent.mother_email);
    const parentName  = (parent && parent.father_full_name) || (parent && parent.mother_full_name) || 'Parent';

    if (parentEmail) {
      const roleRes = await authPool.query(`SELECT id FROM roles WHERE name = 'PARENT' LIMIT 1`);
      if (roleRes.rows.length > 0) {
        const roleId = roleRes.rows[0].id;
        const tempPwd = await bcrypt.hash('Parent@123', 10);
        const newParentId = crypto.randomUUID();

        const insertRes = await authPool.query(
          `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [newParentId, schoolId, roleId, parentName, parentEmail, tempPwd]
        );
        parentAuthId = (insertRes.rows[0] && insertRes.rows[0].id) || null;
        console.log(`Bridge 2: parent auth user created for ${parentEmail} (id: ${parentAuthId})`);
      }
    }

    // ── Create student in students table ────────────────────────────────────
    if (classId) {
      const rollNo = parseInt(academic.roll_number, 10) || 1;
      await pool.query(
        `INSERT INTO students (school_id, class_id, roll_no, name, parent_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (school_id, class_id, roll_no) DO NOTHING`,
        [schoolId, classId, rollNo, studentName, parentAuthId]
      );
      console.log(`Bridge 2: student ${studentName} added to classes table (class_id: ${classId})`);
    } else {
      console.warn(`Bridge 2: no matching class found for admission ${admissionId}. Student not synced to teacher/parent system. Run Bridge 3 (class assignment) first, then re-approve or re-sync.`);
    }
  } catch (error) {
    // Non-fatal: log but don't block admission approval
    console.error('Bridge 2 error:', error.message);
  }
};

// Assert Admin Role
const assertAdminRole = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const error = new Error('Forbidden: only administrators can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

// Validate personal information
const validatePersonalInfo = (data) => {
  const required = ['first_name', 'last_name', 'date_of_birth', 'gender', 'nationality'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

// Validate academic information
const validateAcademicInfo = (data) => {
  const required = ['admission_date', 'class_id', 'section'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

// Validate contact information
const validateContactInfo = (data) => {
  const required = ['student_phone', 'student_email'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

// Validate address information
const validateAddressInfo = (data) => {
  const required = ['current_street', 'current_city', 'current_state', 'current_pincode'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

// Validate parent information
const validateParentInfo = (data) => {
  const required = ['father_full_name', 'father_phone', 'mother_full_name', 'mother_phone'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

// Create new admission (Draft)
const createAdmissionDraft = async (user) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.createAdmission({
    schoolId: user.school_id
  });

  return {
    success: true,
    data: admission,
    message: 'Admission draft created'
  };
};

// Get admission by ID
const getAdmissionById = async (user, admissionId) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return {
    success: true,
    data: admission
  };
};

// Get admissions by status
const getAdmissionsByStatus = async (user, status, limit, offset) => {
  assertAdminRole(user);

  const admissions = await admissionsRepository.getAdmissionsByStatus({
    schoolId: user.school_id,
    status,
    limit,
    offset
  });

  return {
    success: true,
    data: admissions,
    count: admissions.length
  };
};

// Get all admissions with complete draft data
const getAllAdmissionsWithDraft = async (user, limit, offset, status) => {
  assertAdminRole(user);

  const result = await admissionsRepository.getAllAdmissionsWithDraft({
    schoolId: user.school_id,
    limit,
    offset,
    status
  });

  return {
    success: true,
    message: 'All admissions retrieved successfully',
    total: result.total,
    count: result.admissions.length,
    limit,
    offset,
    data: result.admissions
  };
};

// Save personal information
const savePersonalInfo = async (user, admissionId, personalData) => {
  assertAdminRole(user);

  // Get admission first
  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Validate
  validatePersonalInfo(personalData);

  // Save
  const saved = await admissionsRepository.savePersonalInfo({
    schoolId: user.school_id,
    admissionId,
    personalData
  });

  return {
    success: true,
    data: saved,
    message: 'Personal information saved'
  };
};

// Save academic information
const saveAcademicInfo = async (user, admissionId, academicData, token) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Validate class exists in common-api
  const classExists = await validateClassExists(academicData.class_id, token);
  if (!classExists) {
    const error = new Error('Invalid class ID');
    error.statusCode = 400;
    error.code = 'INVALID_CLASS';
    throw error;
  }

  validateAcademicInfo(academicData);

  const saved = await admissionsRepository.saveAcademicInfo({
    schoolId: user.school_id,
    admissionId,
    academicData
  });

  return {
    success: true,
    data: saved,
    message: 'Academic information saved'
  };
};

// Submit admission for verification
const submitAdmission = async (user, admissionId) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Check all required fields are filled
  const allFilled = await admissionsRepository.checkAllRequiredFieldsFilled({
    schoolId: user.school_id,
    admissionId
  });

  if (!allFilled) {
    const error = new Error('Please fill all required fields before submitting');
    error.statusCode = 400;
    error.code = 'INCOMPLETE_DATA';
    throw error;
  }

  // Update status to Under Verification
  const updated = await admissionsRepository.updateAdmissionStatus({
    schoolId: user.school_id,
    admissionId,
    status: 'Under Verification',
    submittedBy: 'student'
  });

  // ✅ Also update document statuses to match
  await admissionsRepository.updateDocumentStatuses({
    schoolId: user.school_id,
    admissionId,
    birth_certificate_status: 'Under Verification',
    aadhaar_card_status: 'Under Verification',
    transfer_certificate_status: 'Under Verification'
  });

  return {
    success: true,
    data: updated,
    message: 'Admission submitted for verification'
  };
};

// Approve admission (Assistant Admin)
const approveAdmission = async (user, admissionId) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (admission.admission_status !== 'Under Verification') {
    const error = new Error('Only Under Verification admissions can be approved');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  const updated = await admissionsRepository.updateAdmissionStatus({
    schoolId: user.school_id,
    admissionId,
    status: 'Approved',
    submittedBy: 'assistant_admin'
  });

  // ✅ Also update document statuses to Approved
  await admissionsRepository.updateDocumentStatuses({
    schoolId: user.school_id,
    admissionId,
    birth_certificate_status: 'Approved',
    aadhaar_card_status: 'Approved',
    transfer_certificate_status: 'Approved'
  });

  // ✅ When approval is successful, also update the enquiry status to Converted
  if (admission.enquiry_id) {
    try {
      const enquiriesRepository = require('../enquiries/admin.enquiries.repository');
      await enquiriesRepository.updateEnquiryStatus({
        schoolId: user.school_id,
        enquiryId: admission.enquiry_id,
        status: 'Converted'
      });
    } catch (error) {
      console.error('Failed to update enquiry status:', error);
      // Don't throw - continue with admission approval even if enquiry update fails
    }
  }

  // Bridge 2: create parent auth user + sync student to teacher/parent system
  await runBridge2(user.school_id, admissionId);

  return {
    success: true,
    data: updated,
    message: 'Admission approved'
  };
};

const rejectAdmission = async (user, admissionId) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (admission.admission_status !== 'Under Verification') {
    const error = new Error('Only Under Verification admissions can be rejected');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  const updated = await admissionsRepository.updateAdmissionStatus({
    schoolId: user.school_id,
    admissionId,
    status: 'Rejected',
    submittedBy: 'assistant_admin'
  });

  // ✅ Also update document statuses to Rejected
  await admissionsRepository.updateDocumentStatuses({
    schoolId: user.school_id,
    admissionId,
    birth_certificate_status: 'Rejected',
    aadhaar_card_status: 'Rejected',
    transfer_certificate_status: 'Rejected'
  });

  return {
    success: true,
    data: updated,
    message: 'Admission rejected'
  };
};

// Save document
const saveDocument = async (user, admissionId, documentType, filePath) => {
  assertAdminRole(user);

  const admission = await admissionsRepository.getAdmissionById({
    schoolId: user.school_id,
    admissionId
  });

  if (!admission) {
    const error = new Error('Admission not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const saved = await admissionsRepository.saveDocument({
    schoolId: user.school_id,
    admissionId,
    documentType,
    filePath
  });

  return {
    success: true,
    data: saved,
    message: `${documentType.replace('-', ' ')} uploaded successfully`
  };
};

module.exports = {
  createAdmissionDraft,
  getAdmissionById,
  getAdmissionsByStatus,
  getAllAdmissionsWithDraft,
  savePersonalInfo,
  saveAcademicInfo,
  submitAdmission,
  approveAdmission,
  rejectAdmission,
  saveDocument,
  assertAdminRole
};
