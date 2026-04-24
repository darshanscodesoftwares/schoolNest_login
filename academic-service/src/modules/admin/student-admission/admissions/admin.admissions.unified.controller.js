// ============================================================
// UNIFIED SAVE DRAFT CONTROLLER
// ============================================================
// One endpoint handles all sections: personal, academic, contact, address, parent, guardian, emergency, medical

const pool = require("../../../../config/db");

// ============================================================
// 1️⃣ UNIFIED SAVE DRAFT
// ============================================================
// POST /api/v1/academic/admin/admissions/{student_id}/save-draft
// Body: { section: "personal|academic|contact|...", data: {...} }

async function saveDraft(req, res) {
  try {
    const { studentId } = req.params;
    const { section, data } = req.body;
    const schoolId = req.user.school_id;

    // Validate inputs
    if (!section) {
      return res.status(400).json({
        success: false,
        error: "MISSING_SECTION",
        message: "Section parameter is required (personal, academic, contact, address, parent, guardian, emergency, medical)",
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "MISSING_DATA",
        message: "Data object is required",
      });
    }

    // Validate section type
    const validSections = ["personal", "academic", "contact", "address", "parent", "guardian", "emergency", "medical"];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_SECTION",
        message: `Invalid section. Must be one of: ${validSections.join(", ")}`,
      });
    }

    // Route to appropriate handler based on section
    let result;
    switch (section) {
      case "personal":
        result = await handlePersonalInfoSave(studentId, schoolId, data);
        break;
      case "academic":
        result = await handleAcademicInfoSave(studentId, schoolId, data);
        break;
      case "contact":
        result = await handleContactInfoSave(studentId, schoolId, data);
        break;
      case "address":
        result = await handleAddressInfoSave(studentId, schoolId, data);
        break;
      case "parent":
        result = await handleParentInfoSave(studentId, schoolId, data);
        break;
      case "guardian":
        result = await handleGuardianInfoSave(studentId, schoolId, data);
        break;
      case "emergency":
        result = await handleEmergencyContactInfoSave(studentId, schoolId, data);
        break;
      case "medical":
        result = await handleMedicalInfoSave(studentId, schoolId, data);
        break;
    }

    return res.status(200).json({
      success: true,
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} information saved successfully`,
      section,
      updated_at: new Date().toISOString(),
      data: result,
    });
  } catch (error) {
    console.error("Save Draft Error:", error);

    // Handle duplicate roll number error
    if (error.code === "23505" && error.constraint === "uq_roll_number") {
      return res.status(400).json({
        success: false,
        error: "DUPLICATE_ROLL_NUMBER",
        message: `Roll number already assigned to another student in this class and section`,
      });
    }

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to save draft",
    });
  }
}

// ============================================================
// HANDLERS FOR EACH SECTION
// ============================================================

// 📝 PERSONAL INFO HANDLER
async function handlePersonalInfoSave(studentId, schoolId, data) {
  // Check if record exists
  const existing = await pool.query(
    "SELECT id FROM personal_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // UPDATE
    const result = await pool.query(
      `UPDATE personal_information
       SET first_name = $1, last_name = $2, date_of_birth = $3,
           gender = $4, nationality = $5, religion = $6, category = $7,
           blood_group_id = $8, updated_at = NOW()
       WHERE student_id = $9 AND school_id = $10
       RETURNING *`,
      [
        data.firstName,
        data.lastName,
        data.dateOfBirth,
        data.gender,
        data.nationality,
        data.religion || null,
        data.category || null,
        data.bloodGroupId || null,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    // INSERT
    const result = await pool.query(
      `INSERT INTO personal_information
       (school_id, student_id, first_name, last_name, date_of_birth, gender,
        nationality, religion, category, blood_group_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.firstName,
        data.lastName,
        data.dateOfBirth,
        data.gender,
        data.nationality,
        data.religion || null,
        data.category || null,
        data.bloodGroupId || null,
      ]
    );
    return result.rows[0];
  }
}

// 📚 ACADEMIC INFO HANDLER (with roll_number unique constraint)
async function handleAcademicInfoSave(studentId, schoolId, data) {
  // Check if record exists
  const existing = await pool.query(
    "SELECT id FROM academic_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // UPDATE
    const result = await pool.query(
      `UPDATE academic_information
       SET admission_date = $1, class_id = $2, section = $3,
           roll_number = $4, previous_school = $5, updated_at = NOW()
       WHERE student_id = $6 AND school_id = $7
       RETURNING *`,
      [
        data.admissionDate,
        data.grade,
        data.section,
        data.rollNumber || null,
        data.previousSchool || null,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    // INSERT
    const result = await pool.query(
      `INSERT INTO academic_information
       (school_id, student_id, admission_date, class_id, section, roll_number, previous_school)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.admissionDate,
        data.grade,
        data.section,
        data.rollNumber || null,
        data.previousSchool || null,
      ]
    );
    return result.rows[0];
  }
}

// 📞 CONTACT INFO HANDLER
async function handleContactInfoSave(studentId, schoolId, data) {
  const existing = await pool.query(
    "SELECT id FROM contact_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE contact_information
       SET student_phone = $1, student_email = $2, updated_at = NOW()
       WHERE student_id = $3 AND school_id = $4
       RETURNING *`,
      [data.studentPhone || null, data.studentEmail || null, studentId, schoolId]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO contact_information
       (school_id, student_id, student_phone, student_email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [schoolId, studentId, data.studentPhone || null, data.studentEmail || null]
    );
    return result.rows[0];
  }
}

// 🏠 ADDRESS INFO HANDLER
async function handleAddressInfoSave(studentId, schoolId, data) {
  const existing = await pool.query(
    "SELECT id FROM address_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE address_information
       SET current_street = $1, current_city = $2, current_state = $3,
           current_pincode = $4, is_permanent_same = $5, permanent_street = $6,
           permanent_city = $7, permanent_state = $8, permanent_pincode = $9,
           updated_at = NOW()
       WHERE student_id = $10 AND school_id = $11
       RETURNING *`,
      [
        data.currentStreetAddress,
        data.currentCity,
        data.currentState,
        data.currentPincode,
        data.isPermanentSame || false,
        data.permanentStreetAddress || null,
        data.permanentCity || null,
        data.permanentState || null,
        data.permanentPincode || null,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO address_information
       (school_id, student_id, current_street, current_city, current_state, current_pincode,
        is_permanent_same, permanent_street, permanent_city, permanent_state, permanent_pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.currentStreetAddress,
        data.currentCity,
        data.currentState,
        data.currentPincode,
        data.isPermanentSame || false,
        data.permanentStreetAddress || null,
        data.permanentCity || null,
        data.permanentState || null,
        data.permanentPincode || null,
      ]
    );
    return result.rows[0];
  }
}

// 👨‍👩‍👧 PARENT INFO HANDLER
async function handleParentInfoSave(studentId, schoolId, data) {
  const existing = await pool.query(
    "SELECT id FROM parent_guardian_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE parent_guardian_information
       SET father_full_name = $1, father_occupation = $2, father_phone = $3,
           father_email = $4, father_annual_income = $5, mother_full_name = $6,
           mother_occupation = $7, mother_phone = $8, mother_email = $9,
           mother_annual_income = $10, updated_at = NOW()
       WHERE student_id = $11 AND school_id = $12
       RETURNING *`,
      [
        data.fatherName,
        data.fatherOccupation || null,
        data.fatherPhone,
        data.fatherEmail || null,
        data.fatherAnnualIncome || null,
        data.motherName,
        data.motherOccupation || null,
        data.motherPhone,
        data.motherEmail || null,
        data.motherAnnualIncome || null,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO parent_guardian_information
       (school_id, student_id, father_full_name, father_occupation, father_phone,
        father_email, father_annual_income, mother_full_name, mother_occupation,
        mother_phone, mother_email, mother_annual_income)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.fatherName,
        data.fatherOccupation || null,
        data.fatherPhone,
        data.fatherEmail || null,
        data.fatherAnnualIncome || null,
        data.motherName,
        data.motherOccupation || null,
        data.motherPhone,
        data.motherEmail || null,
        data.motherAnnualIncome || null,
      ]
    );
    return result.rows[0];
  }
}

// 👤 GUARDIAN INFO HANDLER
async function handleGuardianInfoSave(studentId, schoolId, data) {
  const existing = await pool.query(
    "SELECT id FROM parent_guardian_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE parent_guardian_information
       SET guardian_full_name = $1, guardian_relation = $2, guardian_phone = $3,
           guardian_email = $4, guardian_occupation = $5, updated_at = NOW()
       WHERE student_id = $6 AND school_id = $7
       RETURNING *`,
      [
        data.guardianName || null,
        data.guardianRelation || null,
        data.guardianPhone || null,
        data.guardianEmail || null,
        data.guardianOccupation || null,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO parent_guardian_information
       (school_id, student_id, guardian_full_name, guardian_relation, guardian_phone, guardian_email, guardian_occupation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.guardianName || null,
        data.guardianRelation || null,
        data.guardianPhone || null,
        data.guardianEmail || null,
        data.guardianOccupation || null,
      ]
    );
    return result.rows[0];
  }
}

// 🆘 EMERGENCY CONTACT INFO HANDLER
async function handleEmergencyContactInfoSave(studentId, schoolId, data) {
  const existing = await pool.query(
    "SELECT id FROM emergency_contact WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE emergency_contact
       SET contact_name = $1, relation = $2, phone = $3, updated_at = NOW()
       WHERE student_id = $4 AND school_id = $5
       RETURNING *`,
      [
        data.emergencyContactName,
        data.emergencyContactRelation || null,
        data.emergencyContactPhone,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO emergency_contact
       (school_id, student_id, contact_name, relation, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.emergencyContactName,
        data.emergencyContactRelation || null,
        data.emergencyContactPhone,
      ]
    );
    return result.rows[0];
  }
}

// ⚕️ MEDICAL INFO HANDLER
async function handleMedicalInfoSave(studentId, schoolId, data) {
  const existing = await pool.query(
    "SELECT id FROM medical_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE medical_information
       SET allergies = $1, medical_conditions = $2, medications = $3,
           family_doctor_name = $4, doctor_phone = $5, updated_at = NOW()
       WHERE student_id = $6 AND school_id = $7
       RETURNING *`,
      [
        data.allergies || null,
        data.medicalConditions || null,
        data.currentMedications || null,
        data.familyDoctorName || null,
        data.doctorPhone || null,
        studentId,
        schoolId,
      ]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO medical_information
       (school_id, student_id, allergies, medical_conditions, medications, family_doctor_name, doctor_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        schoolId,
        studentId,
        data.allergies || null,
        data.medicalConditions || null,
        data.currentMedications || null,
        data.familyDoctorName || null,
        data.doctorPhone || null,
      ]
    );
    return result.rows[0];
  }
}

module.exports = {
  saveDraft,
};
