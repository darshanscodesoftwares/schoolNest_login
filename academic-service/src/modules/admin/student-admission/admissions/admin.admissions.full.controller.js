// ============================================================
// FULL TABLE COLUMNS UNIFIED SAVE DRAFT CONTROLLER
// ============================================================
// ONE endpoint saves ALL columns from ALL tables in ONE call!
// POST /api/v1/academic/admin/admissions/save-draft
// No need to save section by section - save everything at once!

const pool = require("../../../../config/db");
const path = require("path");
const fileStorageUtil = require("../../../../utils/fileStorage.util");

// ============================================================
// FULL SAVE DRAFT - ALL COLUMNS IN ONE CALL
// ============================================================
// POST /api/v1/academic/admin/admissions/save-draft
// Body: FormData with { studentId, allData: {...}, photo: file }
// OR JSON with { studentId, allData: { personal: {...}, academic: {...}, ... } }

async function saveDraftFull(req, res) {
  try {
    let { studentId, enquiryId } = req.body;
    let allData = req.body.allData;
    const schoolId = req.user.school_id;
    const admissionStatus = 'Draft'; // ✅ POST /save-draft always creates Draft status

    // Parse allData if it's a string (from FormData)
    if (typeof allData === 'string') {
      allData = JSON.parse(allData);
    }

    // ✅ DETECT PRE-WRAPPED NESTED JSON (from frontend sending {personal: {...}, contact: {...}})
    // If req.body already contains nested sections, use it directly as allData
    const nestedSectionNames = ['personal', 'academic', 'contact', 'address', 'parent', 'emergency', 'medical', 'documents'];
    const hasNestedSections = nestedSectionNames.some(section =>
      req.body[section] !== undefined && typeof req.body[section] === 'object'
    );

    if (hasNestedSections && !allData) {
      // Frontend sent nested JSON like {personal: {...}, contact: {...}}
      // Use it directly as allData
      allData = {};
      nestedSectionNames.forEach(section => {
        if (req.body[section]) {
          allData[section] = req.body[section];
        }
      });
      console.log('✅ Detected pre-wrapped nested JSON from frontend, using directly as allData');
    }

    // Initialize allData if not provided (optional for draft save)
    if (!allData) {
      allData = {};
    }

    // ✅ AUTO-WRAP FLAT DATA FORMAT
    // If frontend sends fields directly in body (not wrapped in allData sections),
    // auto-detect and wrap them into the proper structure

    // Define field mappings for each section
    const fieldMappings = {
      personal: [
        'first_name', 'firstName',
        'last_name', 'lastName',
        'date_of_birth', 'dateOfBirth',
        'gender', 'nationality', 'religion', 'category',
        'blood_group_id', 'bloodGroupId',
        'student_photo', 'studentPhoto'
      ],
      academic: [
        'admission_number', 'admissionNumber',
        'admission_date', 'admissionDate',
        'class_id', 'classId',
        'section',
        'roll_number', 'rollNumber',
        'previous_school', 'previousSchool'
      ],
      contact: [
        'student_phone', 'studentPhone', 'phone',
        'student_email', 'studentEmail', 'email'
      ],
      address: [
        'current_street', 'currentStreet', 'currentStreetAddress',
        'current_city', 'currentCity',
        'current_state', 'currentState',
        'current_pincode', 'currentPincode',
        'is_permanent_same', 'isPermanentSame',
        'permanent_street', 'permanentStreet', 'permanentStreetAddress',
        'permanent_city', 'permanentCity',
        'permanent_state', 'permanentState',
        'permanent_pincode', 'permanentPincode'
      ],
      parent: [
        'father_full_name', 'fatherName', 'fatherFullName',
        'father_occupation', 'fatherOccupation',
        'father_phone', 'fatherPhone',
        'father_email', 'fatherEmail',
        'father_annual_income', 'fatherAnnualIncome',
        'mother_full_name', 'motherName', 'motherFullName',
        'mother_occupation', 'motherOccupation',
        'mother_phone', 'motherPhone',
        'mother_email', 'motherEmail',
        'mother_annual_income', 'motherAnnualIncome',
        'guardian_full_name', 'guardianName', 'guardianFullName',
        'guardian_relation', 'guardianRelation',
        'guardian_phone', 'guardianPhone',
        'guardian_email', 'guardianEmail',
        'guardian_annual_income', 'guardianAnnualIncome'
      ],
      emergency: [
        'emergency_contact_name', 'emergencyContactName', 'contactName', 'contact_name',
        'emergency_contact_relation', 'emergencyContactRelation', 'relation',
        'emergency_contact_phone', 'emergencyContactPhone', 'phone'
      ],
      medical: [
        'allergies',
        'medical_conditions', 'medicalConditions',
        'medications', 'currentMedications',
        'family_doctor_name', 'familyDoctorName',
        'doctor_phone', 'doctorPhone'
      ],
      documents: [
        'birth_certificate', 'birthCertificate',
        'aadhaar_card', 'aadhaarCard',
        'transfer_certificate', 'transferCertificate'
      ]
    };

    // Auto-wrap all sections
    Object.entries(fieldMappings).forEach(([section, fieldNames]) => {
      const hasFieldsInRoot = fieldNames.some(field => req.body[field] !== undefined);

      if (hasFieldsInRoot && (!allData[section] || Object.keys(allData[section]).length === 0)) {
        allData[section] = {};
        fieldNames.forEach(field => {
          if (req.body[field] !== undefined) {
            allData[section][field] = req.body[field];
          }
        });
        console.log(`✅ Auto-wrapped flat data into allData.${section}`);
      }
    });

    // ✅ VALIDATE UNIQUE CONSTRAINTS AFTER AUTO-WRAP (NOW allData.academic is populated)
    if (allData.academic) {
      if (allData.academic.admission_number) {
        const admissionNumber = allData.academic.admission_number;
        const existingAdmission = await pool.query(
          "SELECT id FROM academic_information WHERE admission_number = $1 AND school_id = $2 LIMIT 1",
          [admissionNumber, schoolId]
        );
        if (existingAdmission.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Admission Number "${admissionNumber}" is already used. Please use a different admission number.`,
            code: 'DUPLICATE_ADMISSION_NUMBER',
            field: 'admission_number'
          });
        }
      }

      if (allData.academic.roll_number && allData.academic.class_id) {
        const rollNumber = allData.academic.roll_number;
        const classId = allData.academic.class_id;
        const existingRoll = await pool.query(
          "SELECT id FROM academic_information WHERE roll_number = $1 AND class_id = $2::uuid AND school_id = $3 LIMIT 1",
          [rollNumber, classId, schoolId]
        );
        if (existingRoll.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Roll Number "${rollNumber}" is already used in this class. Please use a different roll number.`,
            code: 'DUPLICATE_ROLL_NUMBER',
            field: 'roll_number'
          });
        }
      }
    }

    // DEBUG: Log incoming data
    console.log('\n=== SAVE DRAFT DEBUG ===');
    console.log('📥 Incoming Request:');
    console.log('  studentId:', studentId);
    console.log('  schoolId:', schoolId);
    console.log('  hasFile:', !!req.file);
    console.log('\n📦 allData Structure (sections with data):');
    Object.entries(allData).forEach(([section, data]) => {
      if (data && Object.keys(data).length > 0) {
        console.log(`  ✅ ${section}:`, Object.keys(data));
      } else {
        console.log(`  ⚠️  ${section}: EMPTY`);
      }
    });
    console.log('========================\n');

    // ✅ Auto-create studentId if not provided
    if (!studentId) {
      const createResult = await pool.query(
        `INSERT INTO students_admission (school_id, admission_status, enquiry_id)
         VALUES ($1, $2, $3)
         RETURNING id as student_id`,
        [schoolId, admissionStatus, enquiryId || null]
      );
      studentId = createResult.rows[0].student_id;
    }

    // ✅ Handle multiple file uploads (photo + documents)
    if (req.files) {
      console.log('📁 Processing uploaded files:', Object.keys(req.files));

      // Ensure documents object exists
      if (!allData.documents) {
        allData.documents = {};
      }

      // Construct base URL for file serving
      const protocol = req.protocol || 'https';
      const host = req.get('host');
      const baseFileUrl = `${protocol}://${host}/api/v1/academic/files`;

      // Handle student_photo
      if (req.files.student_photo && req.files.student_photo[0]) {
        const photoFile = req.files.student_photo[0];
        const fileId = await fileStorageUtil.saveFileToDB(photoFile, schoolId, 'student_photo');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        if (!allData.personal) {
          allData.personal = {};
        }
        allData.personal.student_photo = fileUrl;
        allData.personal.studentPhoto = fileUrl;
        console.log('  ✅ student_photo:', fileUrl);
      }

      // Handle birth_certificate
      if (req.files.birth_certificate && req.files.birth_certificate[0]) {
        const file = req.files.birth_certificate[0];
        const fileId = await fileStorageUtil.saveFileToDB(file, schoolId, 'birth_certificate');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        allData.documents.birth_certificate = fileUrl;
        allData.documents.birthCertificate = fileUrl;
        console.log('  ✅ birth_certificate:', fileUrl);
      }

      // Handle aadhaar_card
      if (req.files.aadhaar_card && req.files.aadhaar_card[0]) {
        const file = req.files.aadhaar_card[0];
        const fileId = await fileStorageUtil.saveFileToDB(file, schoolId, 'aadhaar_card');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        allData.documents.aadhaar_card = fileUrl;
        allData.documents.aadhaarCard = fileUrl;
        console.log('  ✅ aadhaar_card:', fileUrl);
      }

      // Handle transfer_certificate
      if (req.files.transfer_certificate && req.files.transfer_certificate[0]) {
        const file = req.files.transfer_certificate[0];
        const fileId = await fileStorageUtil.saveFileToDB(file, schoolId, 'transfer_certificate');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        allData.documents.transfer_certificate = fileUrl;
        allData.documents.transferCertificate = fileUrl;
        console.log('  ✅ transfer_certificate:', fileUrl);
      }
    }

    // ============================================================
    // SAVE ALL SECTIONS
    // ============================================================

    const savedData = {};

    // 1️⃣ PERSONAL INFORMATION
    if (allData.personal && Object.keys(allData.personal).length > 0) {
      savedData.personal = await handlePersonalInfoSave(studentId, schoolId, allData.personal);
    }

    // 2️⃣ ACADEMIC INFORMATION
    if (allData.academic && (allData.academic.admissionDate || allData.academic.admission_date) &&
        (allData.academic.classId || allData.academic.class_id) &&
        (allData.academic.section)) {
      savedData.academic = await handleAcademicInfoSave(studentId, schoolId, allData.academic);
    }

    // 3️⃣ CONTACT INFORMATION
    if (allData.contact) {
      savedData.contact = await handleContactInfoSave(studentId, schoolId, allData.contact);
    }

    // 4️⃣ ADDRESS INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.address && Object.keys(allData.address).length > 0) {
      const hasRealData = Object.values(allData.address).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.address = await handleAddressInfoSave(studentId, schoolId, allData.address);
      }
    }

    // 5️⃣ PARENT/GUARDIAN INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.parent && Object.keys(allData.parent).length > 0) {
      const hasRealData = Object.values(allData.parent).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.parent = await handleParentInfoSave(studentId, schoolId, allData.parent);
      }
    }

    // 6️⃣ EMERGENCY CONTACT INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.emergency && Object.keys(allData.emergency).length > 0) {
      const hasRealData = Object.values(allData.emergency).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.emergency = await handleEmergencyContactInfoSave(studentId, schoolId, allData.emergency);
      }
    }

    // 7️⃣ MEDICAL INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.medical && Object.keys(allData.medical).length > 0) {
      const hasRealData = Object.values(allData.medical).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.medical = await handleMedicalInfoSave(studentId, schoolId, allData.medical);
      }
    }

    // 8️⃣ DOCUMENTS
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.documents && Object.keys(allData.documents).length > 0) {
      const hasRealData = Object.values(allData.documents).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.documents = await handleDocumentsSave(studentId, schoolId, allData.documents);
      }
    }

    console.log('✅ Save Draft Completed - studentId:', studentId, '| Status:', admissionStatus);

    return res.status(200).json({
      success: true,
      message: "All admission information saved successfully",
      student_id: studentId,
      studentId: studentId, // Also return as camelCase for frontend consistency
      admission_status: admissionStatus,
      saved_sections: Object.keys(savedData),
      updated_at: new Date().toISOString(),
      data: savedData,
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
// HANDLERS FOR EACH TABLE
// ============================================================

// 📝 PERSONAL INFORMATION
async function handlePersonalInfoSave(studentId, schoolId, data) {
  console.log('Personal Info Save - Input Data:', data);

  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const firstName = data.firstName !== undefined || data.first_name !== undefined ? toNull(data.firstName || data.first_name) : undefined;
  const lastName = data.lastName !== undefined || data.last_name !== undefined ? toNull(data.lastName || data.last_name) : undefined;
  const dateOfBirth = data.dateOfBirth !== undefined || data.date_of_birth !== undefined ? toNull(data.dateOfBirth || data.date_of_birth) : undefined;
  const gender = data.gender !== undefined ? toNull(data.gender) : undefined;
  const nationality = data.nationality !== undefined ? toNull(data.nationality) : undefined;
  const religion = data.religion !== undefined ? toNull(data.religion) : undefined;
  const category = data.category !== undefined ? toNull(data.category) : undefined;
  const bloodGroupId = data.bloodGroupId !== undefined || data.blood_group_id !== undefined ? toNull(data.bloodGroupId || data.blood_group_id) : undefined;
  const studentPhoto = data.studentPhoto !== undefined || data.student_photo !== undefined ? toNull(data.studentPhoto || data.student_photo) : undefined;

  console.log('After toNull conversion:', { firstName, lastName, dateOfBirth, gender, nationality, religion, category, bloodGroupId, studentPhoto });

  const existing = await pool.query(
    "SELECT * FROM personal_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(firstName)) {
      updateFields.push(`first_name = $${++paramCount}`);
      updateValues.push(firstName);
    }
    if (isProvided(lastName)) {
      updateFields.push(`last_name = $${++paramCount}`);
      updateValues.push(lastName);
    }
    if (isProvided(dateOfBirth)) {
      updateFields.push(`date_of_birth = $${++paramCount}`);
      updateValues.push(dateOfBirth);
    }
    if (isProvided(gender)) {
      updateFields.push(`gender = $${++paramCount}`);
      updateValues.push(gender);
    }
    if (isProvided(nationality)) {
      updateFields.push(`nationality = $${++paramCount}`);
      updateValues.push(nationality);
    }
    if (isProvided(religion)) {
      updateFields.push(`religion = $${++paramCount}`);
      updateValues.push(religion);
    }
    if (isProvided(category)) {
      updateFields.push(`category = $${++paramCount}`);
      updateValues.push(category);
    }
    if (isProvided(bloodGroupId)) {
      updateFields.push(`blood_group_id = $${++paramCount}`);
      updateValues.push(bloodGroupId);
    }
    if (isProvided(studentPhoto)) {
      updateFields.push(`student_photo = $${++paramCount}`);
      updateValues.push(studentPhoto);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM personal_information WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE personal_information SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    console.log('Update Query:', updateQuery);
    console.log('Update Values:', updateValues);

    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    // ✅ Check if there are required fields (first_name, last_name, date_of_birth, gender, nationality) before inserting
    // This prevents violating NOT NULL constraints
    const hasRequiredFields = isProvided(firstName) && isProvided(lastName) && isProvided(dateOfBirth) &&
                               isProvided(gender) && isProvided(nationality);
    if (!hasRequiredFields) {
      console.log('  ⚠️  Skipping personal INSERT - missing required fields (first_name, last_name, date_of_birth, gender, nationality)');
      return null;
    }

    const result = await pool.query(
      `INSERT INTO personal_information
       (school_id, student_id, first_name, last_name, date_of_birth, gender,
        nationality, religion, category, blood_group_id, student_photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        schoolId,
        studentId,
        firstName || null,
        lastName || null,
        dateOfBirth || null,
        gender || null,
        nationality || null,
        religion || null,
        category || null,
        bloodGroupId || null,
        studentPhoto || null,
      ]
    );
    return result.rows[0];
  }
}

// 📚 ACADEMIC INFORMATION
async function handleAcademicInfoSave(studentId, schoolId, data) {
  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const admissionNumber = data.admissionNumber !== undefined || data.admission_number !== undefined ? toNull(data.admissionNumber || data.admission_number) : undefined;
  const admissionDate = data.admissionDate !== undefined || data.admission_date !== undefined ? toNull(data.admissionDate || data.admission_date) : undefined;
  const classId = data.classId !== undefined || data.class_id !== undefined || data.grade !== undefined ? toNull(data.classId || data.class_id || data.grade) : undefined;
  const section = data.section !== undefined ? toNull(data.section) : undefined;
  const rollNumber = data.rollNumber !== undefined || data.roll_number !== undefined ? toNull(data.rollNumber || data.roll_number) : undefined;
  const previousSchool = data.previousSchool !== undefined || data.previous_school !== undefined ? toNull(data.previousSchool || data.previous_school) : undefined;

  const existing = await pool.query(
    "SELECT * FROM academic_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(admissionNumber)) {
      updateFields.push(`admission_number = $${++paramCount}`);
      updateValues.push(admissionNumber);
    }
    if (isProvided(admissionDate)) {
      updateFields.push(`admission_date = $${++paramCount}`);
      updateValues.push(admissionDate);
    }
    if (isProvided(classId)) {
      updateFields.push(`class_id = $${++paramCount}`);
      updateValues.push(classId);
    }
    if (isProvided(section)) {
      updateFields.push(`section = $${++paramCount}`);
      updateValues.push(section);
    }
    if (isProvided(rollNumber)) {
      updateFields.push(`roll_number = $${++paramCount}`);
      updateValues.push(rollNumber);
    }
    if (isProvided(previousSchool)) {
      updateFields.push(`previous_school = $${++paramCount}`);
      updateValues.push(previousSchool);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM academic_information WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE academic_information SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    // ✅ Allow INSERT even with partial data (all fields are optional on initial save)
    // Database constraints will catch any violations
    const result = await pool.query(
      `INSERT INTO academic_information
       (school_id, student_id, admission_number, admission_date, class_id, section, roll_number, previous_school)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        schoolId,
        studentId,
        admissionNumber || null,
        admissionDate || null,
        classId || null,
        section || null,
        rollNumber || null,
        previousSchool || null,
      ]
    );
    return result.rows[0];
  }
}

// 📞 CONTACT INFORMATION
async function handleContactInfoSave(studentId, schoolId, data) {
  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const studentPhone = data.studentPhone !== undefined || data.student_phone !== undefined || data.phone !== undefined ? toNull(data.studentPhone || data.student_phone || data.phone) : undefined;
  const studentEmail = data.studentEmail !== undefined || data.student_email !== undefined ? toNull(data.studentEmail || data.student_email) : undefined;

  const existing = await pool.query(
    "SELECT * FROM contact_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(studentPhone)) {
      updateFields.push(`student_phone = $${++paramCount}`);
      updateValues.push(studentPhone);
    }
    if (isProvided(studentEmail)) {
      updateFields.push(`student_email = $${++paramCount}`);
      updateValues.push(studentEmail);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM contact_information WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE contact_information SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO contact_information
       (school_id, student_id, student_phone, student_email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [schoolId, studentId, studentPhone || null, studentEmail || null]
    );
    return result.rows[0];
  }
}

// 🏠 ADDRESS INFORMATION
async function handleAddressInfoSave(studentId, schoolId, data) {
  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const currentStreet = data.currentStreetAddress !== undefined || data.currentStreet !== undefined || data.current_street !== undefined ? toNull(data.currentStreetAddress || data.currentStreet || data.current_street) : undefined;
  const currentCity = data.currentCity !== undefined || data.current_city !== undefined ? toNull(data.currentCity || data.current_city) : undefined;
  const currentState = data.currentState !== undefined || data.current_state !== undefined ? toNull(data.currentState || data.current_state) : undefined;
  const currentPincode = data.currentPincode !== undefined || data.current_pincode !== undefined ? toNull(data.currentPincode || data.current_pincode) : undefined;
  const isPermanentSame = data.isPermanentSame !== undefined || data.is_permanent_same !== undefined ? (data.isPermanentSame || data.is_permanent_same) : undefined;
  const permanentStreet = data.permanentStreetAddress !== undefined || data.permanentStreet !== undefined || data.permanent_street !== undefined ? toNull(data.permanentStreetAddress || data.permanentStreet || data.permanent_street) : undefined;
  const permanentCity = data.permanentCity !== undefined || data.permanent_city !== undefined ? toNull(data.permanentCity || data.permanent_city) : undefined;
  const permanentState = data.permanentState !== undefined || data.permanent_state !== undefined ? toNull(data.permanentState || data.permanent_state) : undefined;
  const permanentPincode = data.permanentPincode !== undefined || data.permanent_pincode !== undefined ? toNull(data.permanentPincode || data.permanent_pincode) : undefined;

  const existing = await pool.query(
    "SELECT * FROM address_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(currentStreet)) {
      updateFields.push(`current_street = $${++paramCount}`);
      updateValues.push(currentStreet);
    }
    if (isProvided(currentCity)) {
      updateFields.push(`current_city = $${++paramCount}`);
      updateValues.push(currentCity);
    }
    if (isProvided(currentState)) {
      updateFields.push(`current_state = $${++paramCount}`);
      updateValues.push(currentState);
    }
    if (isProvided(currentPincode)) {
      updateFields.push(`current_pincode = $${++paramCount}`);
      updateValues.push(currentPincode);
    }
    if (isProvided(isPermanentSame)) {
      updateFields.push(`is_permanent_same = $${++paramCount}`);
      updateValues.push(isPermanentSame);
    }
    if (isProvided(permanentStreet)) {
      updateFields.push(`permanent_street = $${++paramCount}`);
      updateValues.push(permanentStreet);
    }
    if (isProvided(permanentCity)) {
      updateFields.push(`permanent_city = $${++paramCount}`);
      updateValues.push(permanentCity);
    }
    if (isProvided(permanentState)) {
      updateFields.push(`permanent_state = $${++paramCount}`);
      updateValues.push(permanentState);
    }
    if (isProvided(permanentPincode)) {
      updateFields.push(`permanent_pincode = $${++paramCount}`);
      updateValues.push(permanentPincode);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM address_information WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE address_information SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    // ✅ Check if there's ANY address data before inserting
    const hasAnyData = isProvided(currentStreet) || isProvided(currentCity) || isProvided(currentState) ||
                       isProvided(currentPincode) || isProvided(isPermanentSame) || isProvided(permanentStreet) ||
                       isProvided(permanentCity) || isProvided(permanentState) || isProvided(permanentPincode);

    if (!hasAnyData) {
      console.log('  ⚠️  Skipping address INSERT - no data provided');
      return null;
    }

    // ✅ All fields allow NULL now - save whatever is provided
    const result = await pool.query(
      `INSERT INTO address_information
       (school_id, student_id, current_street, current_city, current_state, current_pincode,
        is_permanent_same, permanent_street, permanent_city, permanent_state, permanent_pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        schoolId,
        studentId,
        currentStreet || null,
        currentCity || null,
        currentState || null,
        currentPincode || null,
        isPermanentSame || false,
        permanentStreet || null,
        permanentCity || null,
        permanentState || null,
        permanentPincode || null,
      ]
    );
    return result.rows[0];
  }
}

// 👨‍👩‍👧 PARENT/GUARDIAN INFORMATION
async function handleParentInfoSave(studentId, schoolId, data) {
  console.log('👨‍👩‍👧 Parent Info Save - Input Data:', JSON.stringify(data, null, 2));

  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const fatherFullName = data.fatherName !== undefined || data.fatherFullName !== undefined || data.father_full_name !== undefined ? toNull(data.fatherName || data.fatherFullName || data.father_full_name) : undefined;
  const fatherOccupation = data.fatherOccupation !== undefined || data.father_occupation !== undefined ? toNull(data.fatherOccupation || data.father_occupation) : undefined;
  const fatherPhone = data.fatherPhone !== undefined || data.father_phone !== undefined ? toNull(data.fatherPhone || data.father_phone) : undefined;
  const fatherEmail = data.fatherEmail !== undefined || data.father_email !== undefined ? toNull(data.fatherEmail || data.father_email) : undefined;
  const fatherAnnualIncome = data.fatherAnnualIncome !== undefined || data.father_annual_income !== undefined ? toNull(data.fatherAnnualIncome || data.father_annual_income) : undefined;
  const motherFullName = data.motherName !== undefined || data.motherFullName !== undefined || data.mother_full_name !== undefined ? toNull(data.motherName || data.motherFullName || data.mother_full_name) : undefined;
  const motherOccupation = data.motherOccupation !== undefined || data.mother_occupation !== undefined ? toNull(data.motherOccupation || data.mother_occupation) : undefined;
  const motherPhone = data.motherPhone !== undefined || data.mother_phone !== undefined ? toNull(data.motherPhone || data.mother_phone) : undefined;
  const motherEmail = data.motherEmail !== undefined || data.mother_email !== undefined ? toNull(data.motherEmail || data.mother_email) : undefined;
  const motherAnnualIncome = data.motherAnnualIncome !== undefined || data.mother_annual_income !== undefined ? toNull(data.motherAnnualIncome || data.mother_annual_income) : undefined;
  const guardianFullName = data.guardianName !== undefined || data.guardianFullName !== undefined || data.guardian_full_name !== undefined ? toNull(data.guardianName || data.guardianFullName || data.guardian_full_name) : undefined;
  const guardianRelation = data.guardianRelation !== undefined || data.guardian_relation !== undefined || data.relation !== undefined ? toNull(data.guardianRelation || data.guardian_relation || data.relation) : undefined;
  const guardianPhone = data.guardianPhone !== undefined || data.guardian_phone !== undefined ? toNull(data.guardianPhone || data.guardian_phone) : undefined;
  const guardianEmail = data.guardianEmail !== undefined || data.guardian_email !== undefined ? toNull(data.guardianEmail || data.guardian_email) : undefined;
  const guardianAnnualIncome = data.guardianAnnualIncome !== undefined || data.guardian_annual_income !== undefined ? toNull(data.guardianAnnualIncome || data.guardian_annual_income) : undefined;

  const existing = await pool.query(
    "SELECT * FROM parent_guardian_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(fatherFullName)) {
      updateFields.push(`father_full_name = $${++paramCount}`);
      updateValues.push(fatherFullName);
    }
    if (isProvided(fatherOccupation)) {
      updateFields.push(`father_occupation = $${++paramCount}`);
      updateValues.push(fatherOccupation);
    }
    if (isProvided(fatherPhone)) {
      updateFields.push(`father_phone = $${++paramCount}`);
      updateValues.push(fatherPhone);
    }
    if (isProvided(fatherEmail)) {
      updateFields.push(`father_email = $${++paramCount}`);
      updateValues.push(fatherEmail);
    }
    if (isProvided(fatherAnnualIncome)) {
      updateFields.push(`father_annual_income = $${++paramCount}`);
      updateValues.push(fatherAnnualIncome);
    }
    if (isProvided(motherFullName)) {
      updateFields.push(`mother_full_name = $${++paramCount}`);
      updateValues.push(motherFullName);
    }
    if (isProvided(motherOccupation)) {
      updateFields.push(`mother_occupation = $${++paramCount}`);
      updateValues.push(motherOccupation);
    }
    if (isProvided(motherPhone)) {
      updateFields.push(`mother_phone = $${++paramCount}`);
      updateValues.push(motherPhone);
    }
    if (isProvided(motherEmail)) {
      updateFields.push(`mother_email = $${++paramCount}`);
      updateValues.push(motherEmail);
    }
    if (isProvided(motherAnnualIncome)) {
      updateFields.push(`mother_annual_income = $${++paramCount}`);
      updateValues.push(motherAnnualIncome);
    }
    if (isProvided(guardianFullName)) {
      updateFields.push(`guardian_full_name = $${++paramCount}`);
      updateValues.push(guardianFullName);
    }
    if (isProvided(guardianRelation)) {
      updateFields.push(`guardian_relation = $${++paramCount}`);
      updateValues.push(guardianRelation);
    }
    if (isProvided(guardianPhone)) {
      updateFields.push(`guardian_phone = $${++paramCount}`);
      updateValues.push(guardianPhone);
    }
    if (isProvided(guardianEmail)) {
      updateFields.push(`guardian_email = $${++paramCount}`);
      updateValues.push(guardianEmail);
    }
    if (isProvided(guardianAnnualIncome)) {
      updateFields.push(`guardian_annual_income = $${++paramCount}`);
      updateValues.push(guardianAnnualIncome);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM parent_guardian_information WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE parent_guardian_information SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO parent_guardian_information
       (school_id, student_id, father_full_name, father_occupation, father_phone,
        father_email, father_annual_income, mother_full_name, mother_occupation,
        mother_phone, mother_email, mother_annual_income, guardian_full_name,
        guardian_relation, guardian_phone, guardian_email, guardian_annual_income)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        schoolId,
        studentId,
        fatherFullName || null,
        fatherOccupation || null,
        fatherPhone || null,
        fatherEmail || null,
        fatherAnnualIncome || null,
        motherFullName || null,
        motherOccupation || null,
        motherPhone || null,
        motherEmail || null,
        motherAnnualIncome || null,
        guardianFullName || null,
        guardianRelation || null,
        guardianPhone || null,
        guardianEmail || null,
        guardianAnnualIncome || null,
      ]
    );
    return result.rows[0];
  }
}

// 🆘 EMERGENCY CONTACT INFORMATION
async function handleEmergencyContactInfoSave(studentId, schoolId, data) {
  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const contactName = data.emergencyContactName !== undefined || data.contactName !== undefined || data.contact_name !== undefined ? toNull(data.emergencyContactName || data.contactName || data.contact_name) : undefined;
  const relation = data.emergencyContactRelation !== undefined || data.relation !== undefined ? toNull(data.emergencyContactRelation || data.relation) : undefined;
  const phone = data.emergencyContactPhone !== undefined || data.phone !== undefined ? toNull(data.emergencyContactPhone || data.phone) : undefined;

  const existing = await pool.query(
    "SELECT * FROM emergency_contact WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(contactName)) {
      updateFields.push(`contact_name = $${++paramCount}`);
      updateValues.push(contactName);
    }
    if (isProvided(relation)) {
      updateFields.push(`relation = $${++paramCount}`);
      updateValues.push(relation);
    }
    if (isProvided(phone)) {
      updateFields.push(`phone = $${++paramCount}`);
      updateValues.push(phone);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM emergency_contact WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE emergency_contact SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    // ✅ Check if there's ANY data before inserting
    const hasAnyData = isProvided(contactName) || isProvided(relation) || isProvided(phone);
    if (!hasAnyData) {
      console.log('  ⚠️  Skipping emergency contact INSERT - no data provided');
      return null;
    }

    // ⚠️ contact_name is NOT NULL in database, provide a default if missing
    const finalContactName = contactName || 'Not Provided';

    const result = await pool.query(
      `INSERT INTO emergency_contact
       (school_id, student_id, contact_name, relation, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        schoolId,
        studentId,
        finalContactName,
        relation || null,
        phone || null,
      ]
    );
    return result.rows[0];
  }
}

// ⚕️ MEDICAL INFORMATION
async function handleMedicalInfoSave(studentId, schoolId, data) {
  // Helper function to convert empty strings to null
  const toNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  };

  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const allergies = data.allergies !== undefined ? toNull(data.allergies) : undefined;
  const medicalConditions = data.medicalConditions !== undefined || data.medical_conditions !== undefined ? toNull(data.medicalConditions || data.medical_conditions) : undefined;
  const medications = data.currentMedications !== undefined || data.medications !== undefined ? toNull(data.currentMedications || data.medications) : undefined;
  const familyDoctorName = data.familyDoctorName !== undefined || data.family_doctor_name !== undefined ? toNull(data.familyDoctorName || data.family_doctor_name) : undefined;
  const doctorPhone = data.doctorPhone !== undefined || data.doctor_phone !== undefined ? toNull(data.doctorPhone || data.doctor_phone) : undefined;

  const existing = await pool.query(
    "SELECT * FROM medical_information WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(allergies)) {
      updateFields.push(`allergies = $${++paramCount}`);
      updateValues.push(allergies);
    }
    if (isProvided(medicalConditions)) {
      updateFields.push(`medical_conditions = $${++paramCount}`);
      updateValues.push(medicalConditions);
    }
    if (isProvided(medications)) {
      updateFields.push(`medications = $${++paramCount}`);
      updateValues.push(medications);
    }
    if (isProvided(familyDoctorName)) {
      updateFields.push(`family_doctor_name = $${++paramCount}`);
      updateValues.push(familyDoctorName);
    }
    if (isProvided(doctorPhone)) {
      updateFields.push(`doctor_phone = $${++paramCount}`);
      updateValues.push(doctorPhone);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM medical_information WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE medical_information SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
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
        allergies || null,
        medicalConditions || null,
        medications || null,
        familyDoctorName || null,
        doctorPhone || null,
      ]
    );
    return result.rows[0];
  }
}

// 📄 DOCUMENTS
async function handleDocumentsSave(studentId, schoolId, data) {
  // Helper function to check if a field was provided in the request
  const isProvided = (value) => {
    return value !== undefined && value !== null;
  };

  // Normalize field names - accept both camelCase and snake_case
  // ONLY convert fields that were actually provided
  const birthCertificate = data.birthCertificate !== undefined || data.birth_certificate !== undefined ? (data.birthCertificate || data.birth_certificate) : undefined;
  const birthCertificateStatus = data.birthCertificateStatus !== undefined || data.birth_certificate_status !== undefined ? (data.birthCertificateStatus || data.birth_certificate_status) : undefined;
  const aadhaarCard = data.aadhaarCard !== undefined || data.aadhaar_card !== undefined ? (data.aadhaarCard || data.aadhaar_card) : undefined;
  const aadhaarCardStatus = data.aadhaarCardStatus !== undefined || data.aadhaar_card_status !== undefined ? (data.aadhaarCardStatus || data.aadhaar_card_status) : undefined;
  const transferCertificate = data.transferCertificate !== undefined || data.transfer_certificate !== undefined ? (data.transferCertificate || data.transfer_certificate) : undefined;
  const transferCertificateStatus = data.transferCertificateStatus !== undefined || data.transfer_certificate_status !== undefined ? (data.transferCertificateStatus || data.transfer_certificate_status) : undefined;

  const existing = await pool.query(
    "SELECT * FROM student_documents WHERE student_id = $1 AND school_id = $2",
    [studentId, schoolId]
  );

  if (existing.rows.length > 0) {
    // Build dynamic UPDATE query - only update provided fields
    const updateFields = [];
    const updateValues = [studentId, schoolId];
    let paramCount = 2;

    if (isProvided(birthCertificate)) {
      updateFields.push(`birth_certificate = $${++paramCount}`);
      updateValues.push(birthCertificate);
    }
    if (isProvided(birthCertificateStatus)) {
      updateFields.push(`birth_certificate_status = $${++paramCount}`);
      updateValues.push(birthCertificateStatus);
    }
    if (isProvided(aadhaarCard)) {
      updateFields.push(`aadhaar_card = $${++paramCount}`);
      updateValues.push(aadhaarCard);
    }
    if (isProvided(aadhaarCardStatus)) {
      updateFields.push(`aadhaar_card_status = $${++paramCount}`);
      updateValues.push(aadhaarCardStatus);
    }
    if (isProvided(transferCertificate)) {
      updateFields.push(`transfer_certificate = $${++paramCount}`);
      updateValues.push(transferCertificate);
    }
    if (isProvided(transferCertificateStatus)) {
      updateFields.push(`transfer_certificate_status = $${++paramCount}`);
      updateValues.push(transferCertificateStatus);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, no changes
      const result = await pool.query(
        "SELECT * FROM student_documents WHERE student_id = $1 AND school_id = $2",
        [studentId, schoolId]
      );
      return result.rows[0];
    }

    const updateQuery = `UPDATE student_documents SET ${updateFields.join(', ')} WHERE student_id = $1 AND school_id = $2 RETURNING *`;
    const result = await pool.query(updateQuery, updateValues);
    return result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO student_documents
       (school_id, student_id, birth_certificate, birth_certificate_status,
        aadhaar_card, aadhaar_card_status, transfer_certificate, transfer_certificate_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        schoolId,
        studentId,
        birthCertificate || null,
        birthCertificateStatus || "Pending",
        aadhaarCard || null,
        aadhaarCardStatus || "Pending",
        transferCertificate || null,
        transferCertificateStatus || "Optional",
      ]
    );
    return result.rows[0];
  }
}

// ============================================================
// UPDATE DRAFT - PUT ENDPOINT TO PREVENT DUPLICATES
// ============================================================
// PUT /api/v1/academic/admin/admissions/:studentId/save-draft
// Body: FormData with { allData: {...}, photo: file }
// ✅ studentId comes from URL, so it always updates the SAME record

async function updateDraftFull(req, res) {
  try {
    const { studentId } = req.params;
    let allData = req.body.allData;
    const schoolId = req.user.school_id;

    // Parse allData if it's a string (from FormData)
    if (typeof allData === 'string') {
      allData = JSON.parse(allData);
    }

    // ✅ DETECT PRE-WRAPPED NESTED JSON (from frontend sending {personal: {...}, contact: {...}})
    // If req.body already contains nested sections, use it directly as allData
    const nestedSectionNames = ['personal', 'academic', 'contact', 'address', 'parent', 'emergency', 'medical', 'documents'];
    const hasNestedSections = nestedSectionNames.some(section =>
      req.body[section] !== undefined && typeof req.body[section] === 'object'
    );

    if (hasNestedSections && !allData) {
      // Frontend sent nested JSON like {personal: {...}, contact: {...}}
      // Use it directly as allData
      allData = {};
      nestedSectionNames.forEach(section => {
        if (req.body[section]) {
          allData[section] = req.body[section];
        }
      });
      console.log('✅ Detected pre-wrapped nested JSON from frontend, using directly as allData');
    }

    // Initialize allData if not provided
    if (!allData) {
      allData = {};
    }

    // ✅ AUTO-WRAP FLAT DATA FORMAT (same as POST)
    const fieldMappings = {
      personal: [
        'first_name', 'firstName',
        'last_name', 'lastName',
        'date_of_birth', 'dateOfBirth',
        'gender', 'nationality', 'religion', 'category',
        'blood_group_id', 'bloodGroupId',
        'student_photo', 'studentPhoto'
      ],
      academic: [
        'admission_number', 'admissionNumber',
        'admission_date', 'admissionDate',
        'class_id', 'classId',
        'section',
        'roll_number', 'rollNumber',
        'previous_school', 'previousSchool'
      ],
      contact: [
        'student_phone', 'studentPhone', 'phone',
        'student_email', 'studentEmail', 'email'
      ],
      address: [
        'current_street', 'currentStreet', 'currentStreetAddress',
        'current_city', 'currentCity',
        'current_state', 'currentState',
        'current_pincode', 'currentPincode',
        'is_permanent_same', 'isPermanentSame',
        'permanent_street', 'permanentStreet', 'permanentStreetAddress',
        'permanent_city', 'permanentCity',
        'permanent_state', 'permanentState',
        'permanent_pincode', 'permanentPincode'
      ],
      parent: [
        'father_full_name', 'fatherName', 'fatherFullName',
        'father_occupation', 'fatherOccupation',
        'father_phone', 'fatherPhone',
        'father_email', 'fatherEmail',
        'father_annual_income', 'fatherAnnualIncome',
        'mother_full_name', 'motherName', 'motherFullName',
        'mother_occupation', 'motherOccupation',
        'mother_phone', 'motherPhone',
        'mother_email', 'motherEmail',
        'mother_annual_income', 'motherAnnualIncome',
        'guardian_full_name', 'guardianName', 'guardianFullName',
        'guardian_relation', 'guardianRelation',
        'guardian_phone', 'guardianPhone',
        'guardian_email', 'guardianEmail',
        'guardian_annual_income', 'guardianAnnualIncome'
      ],
      emergency: [
        'emergency_contact_name', 'emergencyContactName', 'contactName', 'contact_name',
        'emergency_contact_relation', 'emergencyContactRelation', 'relation',
        'emergency_contact_phone', 'emergencyContactPhone', 'phone'
      ],
      medical: [
        'allergies',
        'medical_conditions', 'medicalConditions',
        'medications', 'currentMedications',
        'family_doctor_name', 'familyDoctorName',
        'doctor_phone', 'doctorPhone'
      ],
      documents: [
        'birth_certificate', 'birthCertificate',
        'aadhaar_card', 'aadhaarCard',
        'transfer_certificate', 'transferCertificate'
      ]
    };

    // Auto-wrap all sections
    Object.entries(fieldMappings).forEach(([section, fieldNames]) => {
      const hasFieldsInRoot = fieldNames.some(field => req.body[field] !== undefined);

      if (hasFieldsInRoot && (!allData[section] || Object.keys(allData[section]).length === 0)) {
        allData[section] = {};
        fieldNames.forEach(field => {
          if (req.body[field] !== undefined) {
            allData[section][field] = req.body[field];
          }
        });
        console.log(`✅ Auto-wrapped flat data into allData.${section}`);
      }
    });

    // DEBUG: Log incoming data
    console.log('\n=== UPDATE DRAFT DEBUG (PUT) ===');
    console.log('📥 Update Request:');
    console.log('  studentId (from URL):', studentId);
    console.log('  schoolId:', schoolId);
    console.log('  hasFiles:', req.files ? Object.keys(req.files) : 'none');
    console.log('  req.body keys:', Object.keys(req.body));
    console.log('  allData:', JSON.stringify(allData, null, 2));
    console.log('\n📦 allData Structure (sections with data):');
    Object.entries(allData).forEach(([section, data]) => {
      if (data && Object.keys(data).length > 0) {
        console.log(`  ✅ ${section}:`, Object.keys(data), '-', data);
      } else {
        console.log(`  ⚠️  ${section}: EMPTY`);
      }
    });
    console.log('==================================\n');

    // ✅ Verify studentId exists before updating
    const studentCheck = await pool.query(
      "SELECT id FROM students_admission WHERE id = $1 AND school_id = $2",
      [studentId, schoolId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student admission record with ID ${studentId} not found`,
        student_id: studentId
      });
    }

    // ✅ Touch the main record to update updated_at timestamp
    // This ensures the record appears in GET queries with fresh data
    await pool.query(
      "UPDATE students_admission SET updated_at = NOW() WHERE id = $1 AND school_id = $2",
      [studentId, schoolId]
    );
    console.log('  ✅ Main record updated_at refreshed');

    // ✅ Handle multiple file uploads (photo + documents)
    if (req.files) {
      console.log('📁 Processing uploaded files:', Object.keys(req.files));

      // Ensure documents object exists
      if (!allData.documents) {
        allData.documents = {};
      }

      // Construct base URL for file serving
      const protocol = req.protocol || 'https';
      const host = req.get('host');
      const baseFileUrl = `${protocol}://${host}/api/v1/academic/files`;

      // Handle student_photo
      if (req.files.student_photo && req.files.student_photo[0]) {
        const photoFile = req.files.student_photo[0];
        const fileId = await fileStorageUtil.saveFileToDB(photoFile, schoolId, 'student_photo');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        if (!allData.personal) {
          allData.personal = {};
        }
        allData.personal.student_photo = fileUrl;
        allData.personal.studentPhoto = fileUrl;
        console.log('  ✅ student_photo:', fileUrl);
      }

      // Handle birth_certificate
      if (req.files.birth_certificate && req.files.birth_certificate[0]) {
        const file = req.files.birth_certificate[0];
        const fileId = await fileStorageUtil.saveFileToDB(file, schoolId, 'birth_certificate');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        allData.documents.birth_certificate = fileUrl;
        allData.documents.birthCertificate = fileUrl;
        console.log('  ✅ birth_certificate:', fileUrl);
      }

      // Handle aadhaar_card
      if (req.files.aadhaar_card && req.files.aadhaar_card[0]) {
        const file = req.files.aadhaar_card[0];
        const fileId = await fileStorageUtil.saveFileToDB(file, schoolId, 'aadhaar_card');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        allData.documents.aadhaar_card = fileUrl;
        allData.documents.aadhaarCard = fileUrl;
        console.log('  ✅ aadhaar_card:', fileUrl);
      }

      // Handle transfer_certificate
      if (req.files.transfer_certificate && req.files.transfer_certificate[0]) {
        const file = req.files.transfer_certificate[0];
        const fileId = await fileStorageUtil.saveFileToDB(file, schoolId, 'transfer_certificate');
        const fileUrl = `${baseFileUrl}/${fileId}`;
        allData.documents.transfer_certificate = fileUrl;
        allData.documents.transferCertificate = fileUrl;
        console.log('  ✅ transfer_certificate:', fileUrl);
      }
    }

    // ============================================================
    // UPDATE ALL SECTIONS (SAME HANDLERS AS POST)
    // ============================================================

    const savedData = {};

    // 1️⃣ PERSONAL INFORMATION
    if (allData.personal && Object.keys(allData.personal).length > 0) {
      console.log('  📝 Updating personal...');
      savedData.personal = await handlePersonalInfoSave(studentId, schoolId, allData.personal);
    }

    // 2️⃣ ACADEMIC INFORMATION
    // ✅ Fixed: Don't require all fields, update whatever is provided
    if (allData.academic && Object.keys(allData.academic).length > 0) {
      console.log('  📝 Updating academic...');
      savedData.academic = await handleAcademicInfoSave(studentId, schoolId, allData.academic);
    }

    // 3️⃣ CONTACT INFORMATION
    if (allData.contact && Object.keys(allData.contact).length > 0) {
      console.log('  📝 Updating contact...');
      savedData.contact = await handleContactInfoSave(studentId, schoolId, allData.contact);
    }

    // 4️⃣ ADDRESS INFORMATION
    // ✅ Fixed: Don't require all fields, update whatever is provided
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.address && Object.keys(allData.address).length > 0) {
      const hasRealData = Object.values(allData.address).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        console.log('  📝 Updating address...');
        savedData.address = await handleAddressInfoSave(studentId, schoolId, allData.address);
      }
    }

    // 5️⃣ PARENT/GUARDIAN INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.parent && Object.keys(allData.parent).length > 0) {
      const hasRealData = Object.values(allData.parent).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        console.log('  📝 Updating parent...');
        savedData.parent = await handleParentInfoSave(studentId, schoolId, allData.parent);
      }
    }

    // 6️⃣ EMERGENCY CONTACT INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.emergency && Object.keys(allData.emergency).length > 0) {
      const hasRealData = Object.values(allData.emergency).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        console.log('  📝 Updating emergency...');
        savedData.emergency = await handleEmergencyContactInfoSave(studentId, schoolId, allData.emergency);
      }
    }

    // 7️⃣ MEDICAL INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.medical && Object.keys(allData.medical).length > 0) {
      const hasRealData = Object.values(allData.medical).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        console.log('  📝 Updating medical...');
        savedData.medical = await handleMedicalInfoSave(studentId, schoolId, allData.medical);
      }
    }

    // 8️⃣ DOCUMENTS
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.documents && Object.keys(allData.documents).length > 0) {
      const hasRealData = Object.values(allData.documents).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        console.log('  📝 Updating documents...');
        savedData.documents = await handleDocumentsSave(studentId, schoolId, allData.documents);
      }
    }

    console.log('✅ Update Draft Completed - studentId:', studentId);

    return res.status(200).json({
      success: true,
      message: "Draft updated successfully (no duplicates created)",
      student_id: studentId,
      studentId: studentId,
      saved_sections: Object.keys(savedData),
      updated_at: new Date().toISOString(),
      data: savedData,
    });
  } catch (error) {
    console.error("Update Draft Error:", error);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to update draft",
    });
  }
}

// ============================================================
// COMPREHENSIVE ADMISSION SAVE - Normal Form with All Details
// ============================================================
// POST /api/v1/academic/admin/admissions/complete-save
// Saves COMPLETE admission form with all details and unified image paths
// Returns full student profile with all images in unified response

async function completeSaveAdmission(req, res) {
  try {
    let allData = req.body.allData;
    const { enquiryId } = req.body;
    const schoolId = req.user.school_id;
    const admissionStatus = 'Under Verification'; // ✅ POST /complete-save creates Under Verification status

    // Parse allData if it's a string (from FormData)
    if (typeof allData === 'string') {
      allData = JSON.parse(allData);
    }

    // ✅ DETECT PRE-WRAPPED NESTED JSON (from frontend sending {personal: {...}, contact: {...}})
    // If req.body already contains nested sections, use it directly as allData
    const nestedSectionNames = ['personal', 'academic', 'contact', 'address', 'parent', 'emergency', 'medical', 'documents'];
    const hasNestedSections = nestedSectionNames.some(section =>
      req.body[section] !== undefined && typeof req.body[section] === 'object'
    );

    if (hasNestedSections && !allData) {
      // Frontend sent nested JSON like {personal: {...}, contact: {...}}
      // Use it directly as allData
      allData = {};
      nestedSectionNames.forEach(section => {
        if (req.body[section]) {
          allData[section] = req.body[section];
        }
      });
      console.log('✅ Detected pre-wrapped nested JSON from frontend, using directly as allData');
    }

    // Initialize allData if not provided
    if (!allData) {
      allData = {};
    }

    console.log('\n=== COMPLETE ADMISSION SAVE (POST) ===');
    console.log('📥 Incoming Data Sections:', Object.keys(allData));
    console.log('📁 Files available:', req.files ? Object.keys(req.files) : 'none');

    // ✅ AUTO-WRAP FLAT DATA FORMAT
    const fieldMappings = {
      personal: [
        'first_name', 'firstName',
        'last_name', 'lastName',
        'date_of_birth', 'dateOfBirth',
        'gender', 'nationality', 'religion', 'category',
        'blood_group_id', 'bloodGroupId',
        'student_photo', 'studentPhoto'
      ],
      academic: [
        'admission_number', 'admissionNumber',
        'admission_date', 'admissionDate',
        'class_id', 'classId',
        'section',
        'roll_number', 'rollNumber',
        'previous_school', 'previousSchool'
      ],
      contact: [
        'student_phone', 'studentPhone', 'phone',
        'student_email', 'studentEmail', 'email'
      ],
      address: [
        'current_street', 'currentStreet', 'currentStreetAddress',
        'current_city', 'currentCity',
        'current_state', 'currentState',
        'current_pincode', 'currentPincode',
        'is_permanent_same', 'isPermanentSame',
        'permanent_street', 'permanentStreet', 'permanentStreetAddress',
        'permanent_city', 'permanentCity',
        'permanent_state', 'permanentState',
        'permanent_pincode', 'permanentPincode'
      ],
      parent: [
        'father_full_name', 'fatherName', 'fatherFullName',
        'father_occupation', 'fatherOccupation',
        'father_phone', 'fatherPhone',
        'father_email', 'fatherEmail',
        'father_annual_income', 'fatherAnnualIncome',
        'mother_full_name', 'motherName', 'motherFullName',
        'mother_occupation', 'motherOccupation',
        'mother_phone', 'motherPhone',
        'mother_email', 'motherEmail',
        'mother_annual_income', 'motherAnnualIncome',
        'guardian_full_name', 'guardianName', 'guardianFullName',
        'guardian_relation', 'guardianRelation',
        'guardian_phone', 'guardianPhone',
        'guardian_email', 'guardianEmail',
        'guardian_annual_income', 'guardianAnnualIncome'
      ],
      emergency: [
        'emergency_contact_name', 'emergencyContactName', 'contactName', 'contact_name',
        'emergency_contact_relation', 'emergencyContactRelation', 'relation',
        'emergency_contact_phone', 'emergencyContactPhone', 'phone'
      ],
      medical: [
        'allergies',
        'medical_conditions', 'medicalConditions',
        'medications', 'currentMedications',
        'family_doctor_name', 'familyDoctorName',
        'doctor_phone', 'doctorPhone'
      ],
      documents: [
        'birth_certificate', 'birthCertificate',
        'aadhaar_card', 'aadhaarCard',
        'transfer_certificate', 'transferCertificate'
      ]
    };

    // Auto-wrap all sections
    Object.entries(fieldMappings).forEach(([section, fieldNames]) => {
      const hasFieldsInRoot = fieldNames.some(field => req.body[field] !== undefined);

      if (hasFieldsInRoot && (!allData[section] || Object.keys(allData[section]).length === 0)) {
        allData[section] = {};
        fieldNames.forEach(field => {
          if (req.body[field] !== undefined) {
            allData[section][field] = req.body[field];
          }
        });
        console.log(`✅ Auto-wrapped flat data into allData.${section}`);
      }
    });

    // ✅ VALIDATE UNIQUE CONSTRAINTS AFTER AUTO-WRAP (NOW allData.academic is populated)
    if (allData.academic) {
      if (allData.academic.admission_number) {
        const admissionNumber = allData.academic.admission_number;
        const existingAdmission = await pool.query(
          "SELECT id FROM academic_information WHERE admission_number = $1 AND school_id = $2 LIMIT 1",
          [admissionNumber, schoolId]
        );
        if (existingAdmission.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Admission Number "${admissionNumber}" is already used. Please use a different admission number.`,
            code: 'DUPLICATE_ADMISSION_NUMBER',
            field: 'admission_number'
          });
        }
      }

      if (allData.academic.roll_number && allData.academic.class_id) {
        const rollNumber = allData.academic.roll_number;
        const classId = allData.academic.class_id;
        const existingRoll = await pool.query(
          "SELECT id FROM academic_information WHERE roll_number = $1 AND class_id = $2::uuid AND school_id = $3 LIMIT 1",
          [rollNumber, classId, schoolId]
        );
        if (existingRoll.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Roll Number "${rollNumber}" is already used in this class. Please use a different roll number.`,
            code: 'DUPLICATE_ROLL_NUMBER',
            field: 'roll_number'
          });
        }
      }
    }

    // ✅ Handle multiple file uploads with unified paths
    if (req.files) {
      console.log('📁 Processing uploaded files:', Object.keys(req.files));

      // Ensure documents object exists
      if (!allData.documents) {
        allData.documents = {};
      }

      // Handle student_photo
      if (req.files.student_photo && req.files.student_photo[0]) {
        const photoFile = req.files.student_photo[0];
        const filePath = `/uploads/student-photos/school-${schoolId}/${photoFile.filename}`;
        if (!allData.personal) {
          allData.personal = {};
        }
        allData.personal.student_photo = filePath;
        allData.personal.studentPhoto = filePath;
        console.log('  ✅ student_photo:', filePath);
      }

      // Handle birth_certificate
      if (req.files.birth_certificate && req.files.birth_certificate[0]) {
        const file = req.files.birth_certificate[0];
        const filePath = `/uploads/documents/birth-certificates/school-${schoolId}/${file.filename}`;
        allData.documents.birth_certificate = filePath;
        allData.documents.birthCertificate = filePath;
        console.log('  ✅ birth_certificate:', filePath);
      }

      // Handle aadhaar_card
      if (req.files.aadhaar_card && req.files.aadhaar_card[0]) {
        const file = req.files.aadhaar_card[0];
        const filePath = `/uploads/documents/aadhaar-cards/school-${schoolId}/${file.filename}`;
        allData.documents.aadhaar_card = filePath;
        allData.documents.aadhaarCard = filePath;
        console.log('  ✅ aadhaar_card:', filePath);
      }

      // Handle transfer_certificate
      if (req.files.transfer_certificate && req.files.transfer_certificate[0]) {
        const file = req.files.transfer_certificate[0];
        const filePath = `/uploads/documents/transfer-certificates/school-${schoolId}/${file.filename}`;
        allData.documents.transfer_certificate = filePath;
        allData.documents.transferCertificate = filePath;
        console.log('  ✅ transfer_certificate:', filePath);
      }
    }

    // ============================================================
    // CREATE NEW STUDENT ID
    // ============================================================
    const { v4: uuidv4 } = require('uuid');
    const studentId = uuidv4();

    // ✅ CREATE MAIN STUDENT ADMISSION RECORD (REQUIRED for foreign key)
    await pool.query(
      "INSERT INTO students_admission (id, school_id, admission_status, enquiry_id) VALUES ($1, $2, $3, $4)",
      [studentId, schoolId, admissionStatus, enquiryId || null]
    );
    console.log('✅ Main student record created:', studentId, '| Status:', admissionStatus);

    const savedData = {};

    // 1️⃣ PERSONAL INFORMATION
    if (allData.personal && Object.keys(allData.personal).length > 0) {
      savedData.personal = await handlePersonalInfoSave(studentId, schoolId, allData.personal);
    }

    // 2️⃣ ACADEMIC INFORMATION
    if (allData.academic && Object.keys(allData.academic).length > 0) {
      savedData.academic = await handleAcademicInfoSave(studentId, schoolId, allData.academic);
    }

    // 3️⃣ CONTACT INFORMATION
    if (allData.contact && Object.keys(allData.contact).length > 0) {
      savedData.contact = await handleContactInfoSave(studentId, schoolId, allData.contact);
    }

    // 4️⃣ ADDRESS INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.address && Object.keys(allData.address).length > 0) {
      const hasRealData = Object.values(allData.address).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.address = await handleAddressInfoSave(studentId, schoolId, allData.address);
      }
    }

    // 5️⃣ PARENT/GUARDIAN INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.parent && Object.keys(allData.parent).length > 0) {
      const hasRealData = Object.values(allData.parent).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.parent = await handleParentInfoSave(studentId, schoolId, allData.parent);
      }
    }

    // 6️⃣ EMERGENCY CONTACT INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.emergency && Object.keys(allData.emergency).length > 0) {
      const hasRealData = Object.values(allData.emergency).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.emergency = await handleEmergencyContactInfoSave(studentId, schoolId, allData.emergency);
      }
    }

    // 7️⃣ MEDICAL INFORMATION
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.medical && Object.keys(allData.medical).length > 0) {
      const hasRealData = Object.values(allData.medical).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.medical = await handleMedicalInfoSave(studentId, schoolId, allData.medical);
      }
    }

    // 8️⃣ DOCUMENTS
    // ✅ Skip if no actual data (all fields are null/undefined/empty)
    if (allData.documents && Object.keys(allData.documents).length > 0) {
      const hasRealData = Object.values(allData.documents).some(val =>
        val !== null && val !== undefined && val !== ''
      );
      if (hasRealData) {
        savedData.documents = await handleDocumentsSave(studentId, schoolId, allData.documents);
      }
    }

    // ============================================================
    // BUILD UNIFIED RESPONSE WITH ALL IMAGE PATHS
    // ============================================================
    const unifiedResponse = buildUnifiedAdmissionResponse(studentId, schoolId, savedData);

    console.log('✅ Complete Admission Saved - studentId:', studentId);
    console.log('==================================\n');

    return res.status(201).json({
      success: true,
      message: "Complete admission form saved successfully",
      student_id: studentId,
      admission_status: admissionStatus,
      saved_sections: Object.keys(savedData),
      created_at: new Date().toISOString(),
      data: unifiedResponse
    });
  } catch (error) {
    console.error("Complete Save Admission Error:", error);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to save complete admission",
    });
  }
}

// ============================================================
// UNIFIED RESPONSE BUILDER
// ============================================================
// Builds a single unified object with all details and image paths

function buildUnifiedAdmissionResponse(studentId, schoolId, savedData) {
  return {
    student_id: studentId,
    school_id: schoolId,

    // Personal Information
    personal: savedData.personal ? {
      id: savedData.personal.id,
      first_name: savedData.personal.first_name,
      last_name: savedData.personal.last_name,
      date_of_birth: savedData.personal.date_of_birth,
      gender: savedData.personal.gender,
      blood_group_id: savedData.personal.blood_group_id,
      nationality: savedData.personal.nationality,
      religion: savedData.personal.religion,
      category: savedData.personal.category,
      student_photo: savedData.personal.student_photo
    } : null,

    // Academic Information
    academic: savedData.academic ? {
      id: savedData.academic.id,
      admission_number: savedData.academic.admission_number,
      admission_date: savedData.academic.admission_date,
      class_id: savedData.academic.class_id,
      section: savedData.academic.section,
      roll_number: savedData.academic.roll_number,
      previous_school: savedData.academic.previous_school
    } : null,

    // Contact Information
    contact: savedData.contact ? {
      id: savedData.contact.id,
      student_phone: savedData.contact.student_phone,
      student_email: savedData.contact.student_email
    } : null,

    // Address Information
    address: savedData.address ? {
      id: savedData.address.id,
      current_street: savedData.address.current_street,
      current_city: savedData.address.current_city,
      current_state: savedData.address.current_state,
      current_pincode: savedData.address.current_pincode,
      is_permanent_same: savedData.address.is_permanent_same,
      permanent_street: savedData.address.permanent_street,
      permanent_city: savedData.address.permanent_city,
      permanent_state: savedData.address.permanent_state,
      permanent_pincode: savedData.address.permanent_pincode
    } : null,

    // Parent/Guardian Information
    parent: savedData.parent ? {
      id: savedData.parent.id,
      father_full_name: savedData.parent.father_full_name,
      father_occupation: savedData.parent.father_occupation,
      father_phone: savedData.parent.father_phone,
      father_email: savedData.parent.father_email,
      father_annual_income: savedData.parent.father_annual_income,
      mother_full_name: savedData.parent.mother_full_name,
      mother_occupation: savedData.parent.mother_occupation,
      mother_phone: savedData.parent.mother_phone,
      mother_email: savedData.parent.mother_email,
      mother_annual_income: savedData.parent.mother_annual_income,
      guardian_full_name: savedData.parent.guardian_full_name,
      guardian_relation: savedData.parent.guardian_relation,
      guardian_phone: savedData.parent.guardian_phone,
      guardian_email: savedData.parent.guardian_email,
      guardian_annual_income: savedData.parent.guardian_annual_income
    } : null,

    // Emergency Contact
    emergency: savedData.emergency ? {
      id: savedData.emergency.id,
      contact_name: savedData.emergency.contact_name,
      relation: savedData.emergency.relation,
      phone: savedData.emergency.phone
    } : null,

    // Medical Information
    medical: savedData.medical ? {
      id: savedData.medical.id,
      allergies: savedData.medical.allergies,
      medical_conditions: savedData.medical.medical_conditions,
      medications: savedData.medical.medications,
      family_doctor_name: savedData.medical.family_doctor_name,
      doctor_phone: savedData.medical.doctor_phone
    } : null,

    // Documents with unified image paths
    documents: savedData.documents ? {
      id: savedData.documents.id,
      student_photo: savedData.documents.student_photo || null,
      birth_certificate: savedData.documents.birth_certificate || null,
      birth_certificate_status: savedData.documents.birth_certificate_status,
      aadhaar_card: savedData.documents.aadhaar_card || null,
      aadhaar_card_status: savedData.documents.aadhaar_card_status,
      transfer_certificate: savedData.documents.transfer_certificate || null,
      transfer_certificate_status: savedData.documents.transfer_certificate_status
    } : {
      student_photo: null,
      birth_certificate: null,
      aadhaar_card: null,
      transfer_certificate: null
    }
  };
}

module.exports = {
  saveDraftFull,
  updateDraftFull,
  completeSaveAdmission,
  buildUnifiedAdmissionResponse,
};
