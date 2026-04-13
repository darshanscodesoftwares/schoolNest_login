const pool = require('../../../../config/db');
const { v4: uuidv4 } = require('uuid');

// Create new admission (Draft status)
const createAdmission = async ({ schoolId }) => {
  const studentId = uuidv4();
  const query = {
    text: `
      INSERT INTO students_admission (
        school_id, admission_status, created_at, updated_at
      )
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id as student_id, school_id, admission_status, created_at, updated_at
    `,
    values: [schoolId, 'Draft']
  };

  const result = await pool.query(query);
  return result.rows[0];
};

// Get admission by ID
const getAdmissionById = async ({ schoolId, admissionId }) => {
  const query = {
    text: `
      SELECT
        am.id as student_id,
        am.school_id,
        am.admission_status,
        am.submitted_by,
        am.submitted_date,
        am.created_at,
        am.updated_at,
        pi.id as pi_id, pi.first_name, pi.last_name, pi.date_of_birth, pi.gender,
        pi.blood_group_id, pi.nationality, pi.religion, pi.category, pi.student_photo,
        ai.id as ai_id, ai.admission_number, ai.admission_date, ai.class_id, ai.section,
        ai.roll_number, ai.previous_school,
        ci.id as ci_id, ci.student_phone, ci.student_email,
        addr.id as addr_id, addr.current_street, addr.current_city, addr.current_state,
        addr.current_pincode, addr.is_permanent_same, addr.permanent_street,
        addr.permanent_city, addr.permanent_state, addr.permanent_pincode,
        pg.id as pg_id, pg.father_full_name, pg.father_occupation, pg.father_phone,
        pg.father_email, pg.father_annual_income, pg.mother_full_name, pg.mother_occupation,
        pg.mother_phone, pg.mother_email, pg.mother_annual_income,
        pg.guardian_full_name, pg.guardian_relation, pg.guardian_phone, pg.guardian_email,
        pg.guardian_annual_income,
        ec.id as ec_id, ec.contact_name, ec.relation, ec.phone,
        mi.id as mi_id, mi.allergies, mi.medical_conditions, mi.medications,
        mi.family_doctor_name, mi.doctor_phone,
        sd.id as sd_id, sd.birth_certificate, sd.birth_certificate_status,
        sd.aadhaar_card, sd.aadhaar_card_status, sd.transfer_certificate,
        sd.transfer_certificate_status
      FROM students_admission am
      LEFT JOIN personal_information pi ON am.id = pi.student_id AND am.school_id = pi.school_id
      LEFT JOIN academic_information ai ON am.id = ai.student_id AND am.school_id = ai.school_id
      LEFT JOIN contact_information ci ON am.id = ci.student_id AND am.school_id = ci.school_id
      LEFT JOIN address_information addr ON am.id = addr.student_id AND am.school_id = addr.school_id
      LEFT JOIN parent_guardian_information pg ON am.id = pg.student_id AND am.school_id = pg.school_id
      LEFT JOIN emergency_contact ec ON am.id = ec.student_id AND am.school_id = ec.school_id
      LEFT JOIN medical_information mi ON am.id = mi.student_id AND am.school_id = mi.school_id
      LEFT JOIN student_documents sd ON am.id = sd.student_id AND am.school_id = sd.school_id
      WHERE am.school_id = $1 AND am.id = $2
    `,
    values: [schoolId, admissionId]
  };

  const result = await pool.query(query);
  return result.rows[0] || null;
};

// Get all admissions by status
const getAdmissionsByStatus = async ({ schoolId, status, limit, offset }) => {
  const query = {
    text: `
      SELECT
        am.id as student_id,
        am.school_id,
        am.admission_status,
        am.submitted_by,
        am.submitted_date,
        am.created_at,
        am.updated_at,
        pi.first_name,
        pi.last_name
      FROM students_admission am
      LEFT JOIN personal_information pi ON am.id = pi.student_id AND am.school_id = pi.school_id
      WHERE am.school_id = $1 AND am.admission_status = $2
      ORDER BY am.created_at DESC
      LIMIT $3 OFFSET $4
    `,
    values: [schoolId, status, limit || 20, offset || 0]
  };

  const result = await pool.query(query);
  return result.rows;
};

// Get all admissions with complete draft data (all sections joined)
const getAllAdmissionsWithDraft = async ({ schoolId, limit, offset, status }) => {
  // First get total count
  let countQuery = `
    SELECT COUNT(*) as total FROM students_admission WHERE school_id = $1
  `;
  let countValues = [schoolId];

  if (status) {
    countQuery += ` AND admission_status = $2`;
    countValues.push(status);
  }

  const countResult = await pool.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].total);

  // Now get the paginated data with all joined tables
  let whereClause = `am.school_id = $1`;
  let queryValues = [schoolId];
  let paramCounter = 2;

  if (status) {
    whereClause += ` AND am.admission_status = $${paramCounter}`;
    queryValues.push(status);
    paramCounter++;
  }

  // Add limit and offset to values array
  queryValues.push(limit || 20);
  queryValues.push(offset || 0);
  const limitParamIndex = paramCounter;
  const offsetParamIndex = paramCounter + 1;

  const query = {
    text: `
      SELECT
        am.id as student_id,
        am.school_id,
        am.admission_status,
        am.submitted_by,
        am.submitted_date,
        am.created_at,
        am.updated_at,
        pi.id as pi_id, pi.first_name, pi.last_name, pi.date_of_birth, pi.gender,
        pi.blood_group_id, pi.nationality, pi.religion, pi.category, pi.student_photo,
        ai.id as ai_id, ai.admission_number, ai.admission_date, ai.class_id, ai.section,
        ai.roll_number, ai.previous_school,
        ci.id as ci_id, ci.student_phone, ci.student_email,
        addr.id as addr_id, addr.current_street, addr.current_city, addr.current_state,
        addr.current_pincode, addr.is_permanent_same, addr.permanent_street,
        addr.permanent_city, addr.permanent_state, addr.permanent_pincode,
        pg.id as pg_id, pg.father_full_name, pg.father_occupation, pg.father_phone,
        pg.father_email, pg.father_annual_income, pg.mother_full_name, pg.mother_occupation,
        pg.mother_phone, pg.mother_email, pg.mother_annual_income,
        pg.guardian_full_name, pg.guardian_relation, pg.guardian_phone, pg.guardian_email,
        pg.guardian_annual_income,
        ec.id as ec_id, ec.contact_name, ec.relation, ec.phone,
        mi.id as mi_id, mi.allergies, mi.medical_conditions, mi.medications,
        mi.family_doctor_name, mi.doctor_phone,
        sd.id as sd_id, sd.birth_certificate, sd.birth_certificate_status,
        sd.aadhaar_card, sd.aadhaar_card_status, sd.transfer_certificate,
        sd.transfer_certificate_status
      FROM students_admission am
      LEFT JOIN personal_information pi ON am.id = pi.student_id AND am.school_id = pi.school_id
      LEFT JOIN academic_information ai ON am.id = ai.student_id AND am.school_id = ai.school_id
      LEFT JOIN contact_information ci ON am.id = ci.student_id AND am.school_id = ci.school_id
      LEFT JOIN address_information addr ON am.id = addr.student_id AND am.school_id = addr.school_id
      LEFT JOIN parent_guardian_information pg ON am.id = pg.student_id AND am.school_id = pg.school_id
      LEFT JOIN emergency_contact ec ON am.id = ec.student_id AND am.school_id = ec.school_id
      LEFT JOIN medical_information mi ON am.id = mi.student_id AND am.school_id = mi.school_id
      LEFT JOIN student_documents sd ON am.id = sd.student_id AND am.school_id = sd.school_id
      WHERE ${whereClause}
      ORDER BY am.created_at DESC
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `,
    values: queryValues
  };

  const result = await pool.query(query);

  // Format the response with full image URLs
  const baseURL = process.env.BASE_URL || 'http://localhost:4000';

  const formattedAdmissions = result.rows.map(admission => ({
    ...admission,
    // Only add baseURL if the path doesn't already start with http
    student_photo: admission.student_photo
      ? (admission.student_photo.startsWith('http') ? admission.student_photo : `${baseURL}${admission.student_photo}`)
      : null,
    birth_certificate: admission.birth_certificate
      ? (admission.birth_certificate.startsWith('http') ? admission.birth_certificate : `${baseURL}${admission.birth_certificate}`)
      : null,
    aadhaar_card: admission.aadhaar_card
      ? (admission.aadhaar_card.startsWith('http') ? admission.aadhaar_card : `${baseURL}${admission.aadhaar_card}`)
      : null,
    transfer_certificate: admission.transfer_certificate
      ? (admission.transfer_certificate.startsWith('http') ? admission.transfer_certificate : `${baseURL}${admission.transfer_certificate}`)
      : null,
  }));

  return {
    total,
    admissions: formattedAdmissions
  };
};

// Save personal information
const savePersonalInfo = async ({ schoolId, admissionId, personalData }) => {
  const existingQuery = {
    text: `SELECT id FROM personal_information WHERE school_id = $1 AND student_id = $2`,
    values: [schoolId, admissionId]
  };

  const existing = await pool.query(existingQuery);

  if (existing.rows.length > 0) {
    // UPDATE
    const updateQuery = {
      text: `
        UPDATE personal_information
        SET first_name = $1, last_name = $2, date_of_birth = $3, gender = $4,
            blood_group_id = $5, nationality = $6, religion = $7, category = $8,
            student_photo = $9, updated_at = NOW()
        WHERE school_id = $10 AND student_id = $11
        RETURNING *
      `,
      values: [
        personalData.first_name,
        personalData.last_name,
        personalData.date_of_birth,
        personalData.gender,
        personalData.blood_group_id,
        personalData.nationality,
        personalData.religion,
        personalData.category,
        personalData.student_photo,
        schoolId,
        admissionId
      ]
    };
    const result = await pool.query(updateQuery);
    return result.rows[0];
  } else {
    // INSERT
    const insertQuery = {
      text: `
        INSERT INTO personal_information (
          school_id, student_id, first_name, last_name, date_of_birth, gender,
          blood_group_id, nationality, religion, category, student_photo, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `,
      values: [
        schoolId,
        admissionId,
        personalData.first_name,
        personalData.last_name,
        personalData.date_of_birth,
        personalData.gender,
        personalData.blood_group_id,
        personalData.nationality,
        personalData.religion,
        personalData.category,
        personalData.student_photo
      ]
    };
    const result = await pool.query(insertQuery);
    return result.rows[0];
  }
};

// Save academic information
const saveAcademicInfo = async ({ schoolId, admissionId, academicData }) => {
  const existingQuery = {
    text: `SELECT id FROM academic_information WHERE school_id = $1 AND student_id = $2`,
    values: [schoolId, admissionId]
  };

  const existing = await pool.query(existingQuery);

  if (existing.rows.length > 0) {
    const updateQuery = {
      text: `
        UPDATE academic_information
        SET admission_date = $1, class_id = $2, section = $3,
            roll_number = $4, previous_school = $5, updated_at = NOW()
        WHERE school_id = $6 AND student_id = $7
        RETURNING *
      `,
      values: [
        academicData.admission_date,
        academicData.class_id,
        academicData.section,
        academicData.roll_number,
        academicData.previous_school,
        schoolId,
        admissionId
      ]
    };
    const result = await pool.query(updateQuery);
    return result.rows[0];
  } else {
    const insertQuery = {
      text: `
        INSERT INTO academic_information (
          school_id, student_id, admission_date, class_id, section,
          roll_number, previous_school, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `,
      values: [
        schoolId,
        admissionId,
        academicData.admission_date,
        academicData.class_id,
        academicData.section,
        academicData.roll_number,
        academicData.previous_school
      ]
    };
    const result = await pool.query(insertQuery);
    return result.rows[0];
  }
};

// Save or update document
const saveDocument = async ({ schoolId, admissionId, documentType, filePath }) => {
  const existingQuery = {
    text: `SELECT id FROM student_documents WHERE school_id = $1 AND student_id = $2`,
    values: [schoolId, admissionId]
  };

  const existing = await pool.query(existingQuery);
  const updateField = `${documentType.replace('-', '_')}`;
  const statusField = `${documentType.replace('-', '_')}_status`;

  if (existing.rows.length > 0) {
    const updateQuery = {
      text: `
        UPDATE student_documents
        SET ${updateField} = $1, ${statusField} = 'Verified', updated_at = NOW()
        WHERE school_id = $2 AND student_id = $3
        RETURNING *
      `,
      values: [filePath, schoolId, admissionId]
    };
    const result = await pool.query(updateQuery);
    return result.rows[0];
  } else {
    const insertQuery = {
      text: `
        INSERT INTO student_documents (
          school_id, student_id, ${updateField}, ${statusField}, created_at, updated_at
        )
        VALUES ($1, $2, $3, 'Verified', NOW(), NOW())
        RETURNING *
      `,
      values: [schoolId, admissionId, filePath]
    };
    const result = await pool.query(insertQuery);
    return result.rows[0];
  }
};

// Update admission status
const updateAdmissionStatus = async ({ schoolId, admissionId, status, submittedBy }) => {
  const query = {
    text: `
      UPDATE students_admission
      SET admission_status = $1, submitted_by = $2, submitted_date = NOW(), updated_at = NOW()
      WHERE school_id = $3 AND id = $4
      RETURNING id as student_id, school_id, admission_status, submitted_by, submitted_date, updated_at
    `,
    values: [status, submittedBy, schoolId, admissionId]
  };

  const result = await pool.query(query);
  return result.rows[0];
};

// Check if all required fields are filled
const checkAllRequiredFieldsFilled = async ({ schoolId, admissionId }) => {
  const query = {
    text: `
      SELECT
        (pi.id IS NOT NULL AND pi.first_name IS NOT NULL) as has_personal,
        (ai.id IS NOT NULL AND ai.class_id IS NOT NULL) as has_academic,
        (ci.id IS NOT NULL AND ci.student_phone IS NOT NULL) as has_contact,
        (addr.id IS NOT NULL AND addr.current_city IS NOT NULL) as has_address,
        (pg.id IS NOT NULL AND pg.father_full_name IS NOT NULL) as has_parent,
        (sd.birth_certificate IS NOT NULL AND sd.aadhaar_card IS NOT NULL) as has_documents
      FROM students_admission am
      LEFT JOIN personal_information pi ON am.id = pi.student_id AND am.school_id = pi.school_id
      LEFT JOIN academic_information ai ON am.id = ai.student_id AND am.school_id = ai.school_id
      LEFT JOIN contact_information ci ON am.id = ci.student_id AND am.school_id = ci.school_id
      LEFT JOIN address_information addr ON am.id = addr.student_id AND am.school_id = addr.school_id
      LEFT JOIN parent_guardian_information pg ON am.id = pg.student_id AND am.school_id = pg.school_id
      LEFT JOIN student_documents sd ON am.id = sd.student_id AND am.school_id = sd.school_id
      WHERE am.school_id = $1 AND am.id = $2
    `,
    values: [schoolId, admissionId]
  };

  const result = await pool.query(query);
  if (result.rows.length === 0) return false;

  const row = result.rows[0];
  return row.has_personal && row.has_academic && row.has_contact &&
         row.has_address && row.has_parent && row.has_documents;
};

// ✅ Update document statuses when admission is submitted/approved
const updateDocumentStatuses = async ({
  schoolId,
  admissionId,
  birth_certificate_status,
  aadhaar_card_status,
  transfer_certificate_status
}) => {
  const query = {
    text: `
      UPDATE student_documents
      SET
        birth_certificate_status = $3,
        aadhaar_card_status = $4,
        transfer_certificate_status = $5
      WHERE student_id = $1 AND school_id = $2
      RETURNING *
    `,
    values: [
      admissionId,
      schoolId,
      birth_certificate_status,
      aadhaar_card_status,
      transfer_certificate_status
    ]
  };

  const result = await pool.query(query);
  return result.rows[0] || null;
};

module.exports = {
  createAdmission,
  getAdmissionById,
  getAdmissionsByStatus,
  getAllAdmissionsWithDraft,
  savePersonalInfo,
  saveAcademicInfo,
  saveDocument,
  updateAdmissionStatus,
  checkAllRequiredFieldsFilled,
  updateDocumentStatuses
};
