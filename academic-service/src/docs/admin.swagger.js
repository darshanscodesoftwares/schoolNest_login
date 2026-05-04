// ============================================================
// ADMIN - AUTH (via auth-service, documented here for convenience)
// ============================================================

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Admin - Auth]
 *     summary: Login (Admin / Teacher / Parent)
 *     description: Returns a JWT. Use the token in the Authorize button above.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@schoolnest.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: JWT token
 */

// ============================================================
// ADMIN - ENQUIRIES
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/enquiries:
 *   get:
 *     tags: [Admin - Enquiries]
 *     summary: Get all student enquiries
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, Follow-up, Converted, Dropped]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Enquiries list
 *   post:
 *     tags: [Admin - Enquiries]
 *     summary: Create a new student enquiry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [student_name, contact_number]
 *             properties:
 *               student_name:        { type: string, example: Ravi Kumar }
 *               father_name:         { type: string, example: Suresh Kumar }
 *               contact_number:      { type: string, example: "9876543210" }
 *               email:               { type: string, format: email, example: ravi@example.com }
 *               class_id:            { type: string, format: uuid, description: "FK → school_classes.id" }
 *               academic_year:       { type: string, example: "2025-26" }
 *               preferred_medium:    { type: string, enum: [English, Hindi, Kannada, Tamil, Telugu, Other] }
 *               current_school_name: { type: string, example: "ABC Public School" }
 *               residential_area:    { type: string, example: "Whitefield, Bengaluru" }
 *               source_id:           { type: string, format: uuid, description: "FK → enquiry_sources.id" }
 *               transport_required:  { type: boolean, default: false }
 *               siblings_in_school:  { type: boolean, default: false }
 *               religion:            { type: string, example: Hindu }
 *               community_category:  { type: string, enum: [General, OBC, SC, ST, Other] }
 *               remarks:             { type: string }
 *               enquiry_status:      { type: string, enum: [New, Follow-up, Converted, Closed], default: New }
 *     responses:
 *       201:
 *         description: Enquiry created
 *   delete:
 *     tags: [Admin - Enquiries]
 *     summary: Delete all enquiries for the school
 *     responses:
 *       200:
 *         description: All enquiries deleted
 */

/**
 * @swagger
 * /api/v1/academic/admin/enquiries/{enquiryId}:
 *   get:
 *     tags: [Admin - Enquiries]
 *     summary: Get enquiry by ID
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Enquiry details
 *   put:
 *     tags: [Admin - Enquiries]
 *     summary: Update enquiry
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enquiry_status:
 *                 type: string
 *                 enum: [New, Follow-up, Converted, Dropped]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Enquiries]
 *     summary: Delete enquiry
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

/**
 * @swagger
 * /api/v1/academic/admin/enquiries/{enquiryId}/status:
 *   patch:
 *     tags: [Admin - Enquiries]
 *     summary: Update enquiry status
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [New, Follow-up, Converted, Dropped]
 *     responses:
 *       200:
 *         description: Status updated
 */

// ============================================================
// ADMIN - ADMISSIONS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/admissions:
 *   post:
 *     tags: [Admin - Admissions]
 *     summary: "[Advanced] Create EMPTY admission shell (no body)"
 *     description: |
 *       **Most users should NOT use this endpoint.** It exists only for the
 *       multi-step UI wizard where each tab saves separately.
 *
 *       **For normal use, prefer one of these one-shot endpoints instead:**
 *         - `POST /admissions/save-draft`    — create with full data, status = Draft
 *         - `POST /admissions/complete-save` — create with full data, status = Under Verification
 *
 *       This endpoint takes no input — creates an empty admission shell with
 *       school_id from the JWT and returns the new admission UUID, which you
 *       then populate via the section-specific endpoints.
 *     responses:
 *       201:
 *         description: Empty draft created — response contains the new admission `id`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Admission draft created" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440000" }
 *                     admission_status: { type: string, example: "Draft" }
 *   get:
 *     tags: [Admin - Admissions]
 *     summary: Get admissions by status
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Under Verification, Approved, Rejected]
 *           default: Draft
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of admissions
 */

/**
 * @swagger
 * /api/v1/academic/admin/admissions/all/draft:
 *   get:
 *     tags: [Admin - Admissions]
 *     summary: Get all admissions with full draft data
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Admissions with personal, academic, parent data
 */

/**
 * @swagger
 * /api/v1/academic/admin/admissions/{admissionId}:
 *   get:
 *     tags: [Admin - Admissions]
 *     summary: Get admission by ID
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Admission details
 */

/**
 * @swagger
 * /api/v1/academic/admin/admissions/{admissionId}/submit:
 *   put:
 *     tags: [Admin - Admissions]
 *     summary: Submit admission for verification (Draft → Under Verification)
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Submitted
 */

/**
 * @swagger
 * /api/v1/academic/admin/admissions/{admissionId}/approve:
 *   put:
 *     tags: [Admin - Admissions]
 *     summary: Approve admission (Under Verification → Approved)
 *     description: |
 *       Triggers Bridge 2:
 *       - Creates parent user in auth_db (email=father/mother email, password=Parent@123)
 *       - Inserts student into students table (links to classes table via class+section)
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Approved — parent account and student record created
 */

/**
 * @swagger
 * /api/v1/academic/admin/admissions/complete-save:
 *   post:
 *     tags: [Admin - Admissions]
 *     summary: "[Recommended] Create + submit admission in one call (status=Under Verification)"
 *     description: |
 *       Single-call endpoint to create a complete admission and immediately
 *       advance it to **Under Verification** status (skips Draft).
 *
 *       Accepts the SAME fields as `/save-draft` (see that endpoint for the
 *       full field list), plus the same 4 file uploads:
 *       student_photo, birth_certificate, aadhaar_card, transfer_certificate.
 *
 *       After this returns, you only need `POST /admissions/{id}/approve` to
 *       finalise (which triggers Bridge 2 — student row + parent auth user).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             description: Same shape as /save-draft. See that endpoint for all 50+ fields.
 *             properties:
 *               first_name:        { type: string, example: Aarav }
 *               last_name:         { type: string, example: Sharma }
 *               date_of_birth:     { type: string, format: date }
 *               gender:            { type: string, enum: [Male, Female, Other] }
 *               class_id:          { type: string, format: uuid }
 *               section:           { type: string, example: A }
 *               admission_date:    { type: string, format: date }
 *               father_full_name:  { type: string }
 *               father_phone:      { type: string }
 *               father_email:      { type: string, format: email }
 *               student_photo:        { type: string, format: binary }
 *               birth_certificate:    { type: string, format: binary }
 *               aadhaar_card:         { type: string, format: binary }
 *               transfer_certificate: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Admission created and moved to Under Verification
 */

/**
 * @swagger
 * /api/v1/academic/admin/admissions/save-draft:
 *   post:
 *     tags: [Admin - Admissions]
 *     summary: Create a Draft admission with all sections in one call
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             description: |
 *               Saves admission as a draft. Spans 8 child tables (personal,
 *               academic, contact, address, parent/guardian, emergency,
 *               medical, documents). All fields optional at the draft stage —
 *               validation runs on submit/approve.
 *             properties:
 *               # ── personal_information ─────────────────────────────────
 *               first_name:        { type: string, example: Aarav }
 *               last_name:         { type: string, example: Sharma }
 *               date_of_birth:     { type: string, format: date, example: "2015-04-12" }
 *               gender:            { type: string, enum: [Male, Female, Other] }
 *               blood_group_id:    { type: string, format: uuid, description: "FK → blood_groups.id" }
 *               nationality:       { type: string, example: Indian }
 *               religion:          { type: string }
 *               category:          { type: string, enum: [General, OBC, SC, ST, Other] }
 *               # ── academic_information ─────────────────────────────────
 *               admission_number:  { type: string, example: "ADM-2026-001" }
 *               admission_date:    { type: string, format: date, example: "2026-04-15" }
 *               class_id:          { type: string, format: uuid, description: "FK → school_classes.id" }
 *               section:           { type: string, example: A }
 *               roll_number:       { type: string, example: "5" }
 *               previous_school:   { type: string }
 *               # ── contact_information ──────────────────────────────────
 *               student_phone:     { type: string }
 *               student_email:     { type: string, format: email }
 *               # ── address_information (current) ────────────────────────
 *               current_street:    { type: string }
 *               current_city:      { type: string }
 *               current_state:     { type: string }
 *               current_pincode:   { type: string }
 *               # ── address_information (permanent) ──────────────────────
 *               is_permanent_same: { type: boolean, default: false }
 *               permanent_street:  { type: string }
 *               permanent_city:    { type: string }
 *               permanent_state:   { type: string }
 *               permanent_pincode: { type: string }
 *               # ── parent_guardian_information ──────────────────────────
 *               father_full_name:     { type: string }
 *               father_occupation:    { type: string }
 *               father_phone:         { type: string }
 *               father_email:         { type: string, format: email }
 *               father_annual_income: { type: number }
 *               mother_full_name:     { type: string }
 *               mother_occupation:    { type: string }
 *               mother_phone:         { type: string }
 *               mother_email:         { type: string, format: email }
 *               mother_annual_income: { type: number }
 *               guardian_full_name:    { type: string }
 *               guardian_relation:     { type: string }
 *               guardian_phone:        { type: string }
 *               guardian_email:        { type: string, format: email }
 *               guardian_annual_income: { type: number }
 *               # ── emergency_contact ────────────────────────────────────
 *               emergency_contact_name: { type: string }
 *               emergency_relation:     { type: string }
 *               emergency_phone:        { type: string }
 *               # ── medical_information ──────────────────────────────────
 *               allergies:           { type: string }
 *               medical_conditions:  { type: string }
 *               medications:         { type: string }
 *               family_doctor_name:  { type: string }
 *               doctor_phone:        { type: string }
 *               # ── student_documents (file uploads) ─────────────────────
 *               student_photo:        { type: string, format: binary }
 *               birth_certificate:    { type: string, format: binary }
 *               aadhaar_card:         { type: string, format: binary }
 *               transfer_certificate: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Draft saved
 */

// ============================================================
// ADMIN - STUDENTS (Approved)
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/staff-students:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Get all approved students
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Approved students list
 */

/**
 * @swagger
 * /api/v1/academic/admin/staff-students/class/{classId}/section/{section}:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Get approved students by class and section
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           example: A
 *     responses:
 *       200:
 *         description: Students in that class+section
 */

/**
 * @swagger
 * /api/v1/academic/admin/staff-students/class/{classId}/roll/{rollNumber}:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Get approved student by class and roll number
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: rollNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student record
 */

/**
 * @swagger
 * /api/v1/academic/admin/staff-students/{studentId}:
 *   put:
 *     tags: [Admin - Students]
 *     summary: Update approved student record
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               roll_no:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 */

// ============================================================
// ADMIN - TEACHER RECORDS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/teachers:
 *   get:
 *     tags: [Admin - Teacher Records]
 *     summary: Get all teachers
 *     parameters:
 *       - in: query
 *         name: employment_status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, On Leave]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Teacher list
 *   post:
 *     tags: [Admin - Teacher Records]
 *     summary: Create a new teacher
 *     description: |
 *       Triggers Bridge 1: auto-creates login credentials in auth_db.
 *       Teacher can then login with email / Teacher@123 (or via OTP).
 *       FK fields (blood_group_id, department_id, class_ids) come from reference tables seeded by seed-all.js.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [first_name, date_of_birth, gender, nationality, date_of_joining]
 *             properties:
 *               # ── Personal ─────────────────────────────────────────────
 *               first_name:           { type: string, example: Priya }
 *               date_of_birth:        { type: string, format: date, example: "1990-05-15" }
 *               gender:               { type: string, enum: [Male, Female, Other] }
 *               blood_group_id:       { type: string, format: uuid, description: "FK → blood_groups.id" }
 *               nationality:          { type: string, example: Indian }
 *               religion:             { type: string, example: Hindu }
 *               marital_status:       { type: string, enum: [Single, Married, Divorced, Widowed] }
 *               teacher_photo:        { type: string, format: binary }
 *               # ── Contact ──────────────────────────────────────────────
 *               primary_phone:        { type: string, example: "9876543210" }
 *               primary_email:        { type: string, format: email, example: priya.sharma@school.com }
 *               alternate_phone:      { type: string }
 *               alternate_email:      { type: string, format: email }
 *               # ── Address: current ─────────────────────────────────────
 *               current_street:       { type: string, example: "12 Park Street" }
 *               current_city:         { type: string, example: Bengaluru }
 *               current_state:        { type: string, example: Karnataka }
 *               current_pincode:      { type: string, example: "560001" }
 *               # ── Address: permanent ───────────────────────────────────
 *               is_permanent_same:    { type: boolean, default: false }
 *               permanent_street:     { type: string }
 *               permanent_city:       { type: string }
 *               permanent_state:      { type: string }
 *               permanent_pincode:    { type: string }
 *               # ── Employment ───────────────────────────────────────────
 *               employee_id:          { type: string, example: EMP001 }
 *               designation:          { type: string, example: Senior Teacher }
 *               teacher_type:         { type: string, enum: [Full-time, Part-time, Contract, Visiting] }
 *               department_id:        { type: string, format: uuid, description: "FK → departments.id" }
 *               specialization:       { type: string, example: "Algebra & Geometry" }
 *               date_of_joining:      { type: string, format: date, example: "2024-06-01" }
 *               class_ids:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 description: "FKs → school_classes.id (classes the teacher handles)"
 *               employment_status:    { type: string, enum: [Active, Inactive, On Leave], default: Active }
 *               # ── Qualification ────────────────────────────────────────
 *               highest_qualification: { type: string, example: "M.Sc Mathematics" }
 *               university:           { type: string, example: "Bangalore University" }
 *               year_of_passing:      { type: integer, example: 2008 }
 *               percentage_cgpa:      { type: string, example: "8.5" }
 *               additional_certifications: { type: string }
 *               # ── Experience ───────────────────────────────────────────
 *               total_experience_years:        { type: integer, example: 12 }
 *               previous_school_institution:   { type: string, example: "ABC Public School" }
 *               previous_designation:          { type: string, example: Teacher }
 *               experience_at_previous_school: { type: integer, example: 5 }
 *               # ── Salary & Banking ─────────────────────────────────────
 *               monthly_salary:       { type: number, example: 45000 }
 *               bank_name:            { type: string, example: "HDFC Bank" }
 *               account_number:       { type: string, example: "5012345678" }
 *               ifsc_code:            { type: string, example: "HDFC0001234" }
 *               pan_number:           { type: string, example: "ABCDE1234F" }
 *               aadhar_number:        { type: string, example: "123412341234" }
 *               # ── Emergency Contact ────────────────────────────────────
 *               emergency_contact_name: { type: string, example: "Mary Teacher" }
 *               emergency_relation:     { type: string, example: Spouse }
 *               emergency_phone:        { type: string, example: "+91-9000000011" }
 *               # ── Documents (file uploads) ─────────────────────────────
 *               resume_cv:                  { type: string, format: binary }
 *               qualification_certificates: { type: string, format: binary }
 *               experience_certificates:    { type: string, format: binary }
 *               aadhar_card:                { type: string, format: binary }
 *               pan_card:                   { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Teacher created + auth user auto-created (Bridge 1)
 */

/**
 * @swagger
 * /api/v1/academic/admin/teachers/{teacherId}:
 *   get:
 *     tags: [Admin - Teacher Records]
 *     summary: Get teacher by ID
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Teacher details
 *   put:
 *     tags: [Admin - Teacher Records]
 *     summary: Update teacher record
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               primary_email:
 *                 type: string
 *               employment_status:
 *                 type: string
 *                 enum: [Active, Inactive, On Leave]
 *               teacher_photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Teacher Records]
 *     summary: Delete teacher (also removes auth_db user)
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - DRIVER RECORDS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/drivers:
 *   get:
 *     tags: [Admin - Driver Records]
 *     summary: Get all drivers
 *     responses:
 *       200:
 *         description: Driver list
 *   post:
 *     tags: [Admin - Driver Records]
 *     summary: Create driver record
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [first_name, date_of_birth, gender, assign_date]
 *             properties:
 *               # ── Personal ─────────────────────────────────────────────
 *               first_name:           { type: string, example: Ramesh }
 *               last_name:            { type: string, example: Kumar }
 *               date_of_birth:        { type: string, format: date, example: "1985-03-12" }
 *               gender:               { type: string, enum: [Male, Female, Other] }
 *               blood_group_id:       { type: string, format: uuid, description: "FK → blood_groups.id" }
 *               nationality:          { type: string, example: Indian }
 *               driver_photo:         { type: string, format: binary }
 *               # ── Contact ──────────────────────────────────────────────
 *               primary_phone:        { type: string, example: "9876500001" }
 *               primary_email:        { type: string, format: email }
 *               alternate_phone:      { type: string }
 *               alternate_email:      { type: string, format: email }
 *               # ── Address: current ─────────────────────────────────────
 *               current_street:       { type: string }
 *               current_city:         { type: string }
 *               current_state:        { type: string }
 *               current_pincode:      { type: string }
 *               # ── Address: permanent ───────────────────────────────────
 *               is_permanent_same:    { type: boolean, default: false }
 *               permanent_street:     { type: string }
 *               permanent_city:       { type: string }
 *               permanent_state:      { type: string }
 *               permanent_pincode:    { type: string }
 *               # ── License ──────────────────────────────────────────────
 *               license_number:       { type: string, example: "KA0120240001234" }
 *               license_expiry:       { type: string, format: date, example: "2030-03-12" }
 *               license_class:        { type: string, example: "LMV - Light Motor Vehicle" }
 *               commercial_license:   { type: boolean, default: false }
 *               dL_verified:          { type: boolean, default: false }
 *               # ── Assignment ───────────────────────────────────────────
 *               bus_number:           { type: string, example: "KA-01-AB-1234" }
 *               routes:               { type: string, example: "Whitefield → Indiranagar → School" }
 *               assign_date:          { type: string, format: date, example: "2024-06-01" }
 *               # ── Experience ───────────────────────────────────────────
 *               total_experience_years: { type: integer, example: 8 }
 *               previous_employer:      { type: string }
 *               previous_route:         { type: string }
 *               # ── Employment ───────────────────────────────────────────
 *               employment_type:      { type: string, enum: [Permanent, Contractual, Temporary] }
 *               monthly_salary:       { type: number, example: 22000 }
 *               employment_status:    { type: string, enum: [Active, Inactive, On Leave], default: Active }
 *               # ── Identity ─────────────────────────────────────────────
 *               aadhar_number:        { type: string }
 *               pan_number:           { type: string }
 *               # ── Banking ──────────────────────────────────────────────
 *               bank_name:            { type: string }
 *               account_number:       { type: string }
 *               ifsc_code:            { type: string }
 *               # ── Emergency Contact ────────────────────────────────────
 *               emergency_contact_name: { type: string }
 *               emergency_relation:     { type: string }
 *               emergency_phone:        { type: string }
 *               # ── Documents (file uploads) ─────────────────────────────
 *               license_document:     { type: string, format: binary }
 *               aadhar_card:          { type: string, format: binary }
 *               police_clearance:     { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Driver created
 */

/**
 * @swagger
 * /api/v1/academic/admin/drivers/{driverId}:
 *   get:
 *     tags: [Admin - Driver Records]
 *     summary: Get driver by ID
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Driver details
 *   put:
 *     tags: [Admin - Driver Records]
 *     summary: Update driver record
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               employment_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Driver Records]
 *     summary: Delete driver
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - OTHER STAFF
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/other-staff:
 *   get:
 *     tags: [Admin - Other Staff]
 *     summary: Get all other staff
 *     responses:
 *       200:
 *         description: Staff list
 *   post:
 *     tags: [Admin - Other Staff]
 *     summary: Create other staff record
 *     description: |
 *       Non-teaching staff (accountant, librarian, security, etc.).
 *       FK fields (staff_role_id, staff_dept_id, position_level_id) come from the
 *       reference tables seeded by seed-all.js.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [first_name]
 *             properties:
 *               # ── Personal ─────────────────────────────────────────────
 *               first_name:           { type: string, example: Suresh }
 *               last_name:            { type: string, example: Reddy }
 *               date_of_birth:        { type: string, format: date, example: "1980-11-20" }
 *               gender:               { type: string, enum: [Male, Female, Other] }
 *               blood_group_id:       { type: string, format: uuid, description: "FK → blood_groups.id" }
 *               nationality:          { type: string, example: Indian }
 *               staff_photo:          { type: string, format: binary }
 *               # ── Contact ──────────────────────────────────────────────
 *               primary_phone:        { type: string }
 *               primary_email:        { type: string, format: email }
 *               alternate_phone:      { type: string }
 *               alternate_email:      { type: string, format: email }
 *               # ── Address: current ─────────────────────────────────────
 *               current_street:       { type: string }
 *               current_city:         { type: string }
 *               current_state:        { type: string }
 *               current_pincode:      { type: string }
 *               # ── Address: permanent ───────────────────────────────────
 *               is_permanent_same:    { type: boolean, default: false }
 *               permanent_street:     { type: string }
 *               permanent_city:       { type: string }
 *               permanent_state:      { type: string }
 *               permanent_pincode:    { type: string }
 *               # ── Role & Position ──────────────────────────────────────
 *               staff_role_id:        { type: string, format: uuid, description: "FK → staff_roles.id" }
 *               staff_dept_id:        { type: string, format: uuid, description: "FK → staff_departments.id" }
 *               position_level_id:    { type: string, format: uuid, description: "FK → staff_positions.id" }
 *               # ── Employment ───────────────────────────────────────────
 *               employment_type:      { type: string, enum: [Permanent, Contractual, Temporary] }
 *               monthly_salary:       { type: number, example: 18000 }
 *               join_date:            { type: string, format: date, example: "2023-04-01" }
 *               other_staff_employment_status: { type: string, enum: [Active, Inactive, On Leave], default: Active }
 *               # ── Identity ─────────────────────────────────────────────
 *               aadhar_number:        { type: string }
 *               pan_number:           { type: string }
 *               # ── Banking ──────────────────────────────────────────────
 *               bank_name:            { type: string }
 *               account_number:       { type: string }
 *               ifsc_code:            { type: string }
 *               # ── Emergency Contact ────────────────────────────────────
 *               emergency_contact_name: { type: string }
 *               emergency_relation:     { type: string }
 *               emergency_phone:        { type: string }
 *               # ── Documents (file uploads) ─────────────────────────────
 *               adhar_document:       { type: string, format: binary }
 *               pan_card:             { type: string, format: binary }
 *               education_certificate: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Created
 */

/**
 * @swagger
 * /api/v1/academic/admin/other-staff/{staffId}:
 *   get:
 *     tags: [Admin - Other Staff]
 *     summary: Get other staff by ID
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Staff details
 *   put:
 *     tags: [Admin - Other Staff]
 *     summary: Update other staff record
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               employment_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Other Staff]
 *     summary: Delete other staff
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - CLASS ASSIGNMENTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/classes-assign:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get all class-section-teacher assignments
 *     responses:
 *       200:
 *         description: Assignment list with class names, teacher names, student counts
 *   post:
 *     tags: [Admin - Class Assignments]
 *     summary: Create class assignments (batch)
 *     description: |
 *       Triggers Bridge 3: syncs assignment to the teacher/parent `classes` table.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_id, assignments]
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *                 description: school_classes.id
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section_name:
 *                       type: string
 *                       example: A
 *                     teacher_id:
 *                       type: string
 *                       description: teacher_records UUID (= auth_db users.id)
 *     responses:
 *       201:
 *         description: Assignments created + classes table synced
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes-assign/by-class:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get assignments for a specific class
 *     parameters:
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Assignments for that class
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes-assign/sections:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get all unique sections for the school
 *     responses:
 *       200:
 *         description: Section list
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes-assign/class:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get all unique classes that have assignments
 *     responses:
 *       200:
 *         description: Class list with names
 */

/**
 * @swagger
 * /api/v1/academic/admin/teachers-list:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get active teachers list (for assignment dropdown)
 *     responses:
 *       200:
 *         description: Teachers with ID, name, designation
 */

/**
 * @swagger
 * /api/v1/academic/admin/parents-list:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get parents list with child and class info
 *     responses:
 *       200:
 *         description: Parents with student names and class info
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes-assign/{assignmentId}:
 *   get:
 *     tags: [Admin - Class Assignments]
 *     summary: Get assignment by ID
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Assignment details
 *   patch:
 *     tags: [Admin - Class Assignments]
 *     summary: Update assignment (change teacher or section)
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacher_id:
 *                 type: string
 *               section_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Class Assignments]
 *     summary: Delete assignment
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - SUBJECT ASSIGNMENTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/subject-assign:
 *   get:
 *     tags: [Admin - Subject Assignments]
 *     summary: Get all subjects with their class assignments
 *     responses:
 *       200:
 *         description: Subject list with assigned classes and teachers
 *   post:
 *     tags: [Admin - Subject Assignments]
 *     summary: Create a subject and assign to classes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject_name]
 *             properties:
 *               subject_name:
 *                 type: string
 *                 example: Mathematics
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     class_id:
 *                       type: string
 *                       format: uuid
 *                     teacher_id:
 *                       type: string
 *     responses:
 *       201:
 *         description: Subject created and assigned
 */

/**
 * @swagger
 * /api/v1/academic/admin/subject-assign/{subjectId}:
 *   get:
 *     tags: [Admin - Subject Assignments]
 *     summary: Get subject by ID
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subject details
 *   patch:
 *     tags: [Admin - Subject Assignments]
 *     summary: Update subject name or assignments
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Subject Assignments]
 *     summary: Delete subject
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - EXAMS & RESULTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/exams:
 *   get:
 *     tags: [Admin - Exams]
 *     summary: Get all exams
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ONGOING, COMPLETED, PUBLISHED]
 *     responses:
 *       200:
 *         description: Exam list
 *   post:
 *     tags: [Admin - Exams]
 *     summary: Create exam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [exam_name, academic_year, start_date, end_date]
 *             properties:
 *               exam_name:     { type: string, example: "Mid-Term 2026" }
 *               academic_year: { type: string, example: "2025-26" }
 *               start_date:    { type: string, format: date, example: "2026-09-01" }
 *               end_date:      { type: string, format: date, example: "2026-09-15" }
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED, PUBLISHED]
 *                 default: UPCOMING
 *                 description: Lifecycle status — defaults to UPCOMING if omitted
 *     responses:
 *       201:
 *         description: Exam created
 */

/**
 * @swagger
 * /api/v1/academic/admin/exams/{examId}:
 *   get:
 *     tags: [Admin - Exams]
 *     summary: Get exam by ID
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Exam details
 *   patch:
 *     tags: [Admin - Exams]
 *     summary: Update exam fields
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exam_name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED, PUBLISHED]
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Exams]
 *     summary: Delete exam
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

/**
 * @swagger
 * /api/v1/academic/admin/exams/{examId}/details:
 *   get:
 *     tags: [Admin - Exams]
 *     summary: Get exam details (class/section/subject schedule)
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Exam detail rows
 *   post:
 *     tags: [Admin - Exams]
 *     summary: Add exam detail entry
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_id, section_id, subject_id, exam_date, max_marks, pass_marks, teacher_id]
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               section_id:
 *                 type: string
 *                 format: uuid
 *               subject_id:
 *                 type: string
 *                 format: uuid
 *               exam_date:
 *                 type: string
 *                 format: date
 *               max_marks:
 *                 type: integer
 *               pass_marks:
 *                 type: integer
 *               teacher_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Detail added
 */

/**
 * @swagger
 * /api/v1/academic/admin/exams/{examId}/status:
 *   patch:
 *     tags: [Admin - Exams]
 *     summary: Update exam status
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED, PUBLISHED]
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/v1/academic/admin/sections/all:
 *   get:
 *     tags: [Admin - Exams]
 *     summary: Get all sections grouped by class
 *     responses:
 *       200:
 *         description: Sections by class
 */

// ============================================================
// ADMIN - ANNOUNCEMENTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/announcements:
 *   get:
 *     tags: [Admin - Announcements]
 *     summary: Get all announcements
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Sent]
 *     responses:
 *       200:
 *         description: Announcement list
 *   post:
 *     tags: [Admin - Announcements]
 *     summary: Send an announcement
 *     description: |
 *       Sender info (sender_id, sender_name, sender_role) and recipient_count
 *       are auto-populated from the JWT and the resolved audience.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message, audience_type]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "School Closed Tomorrow"
 *               message:
 *                 type: string
 *                 example: "School will remain closed on 14th April due to public holiday."
 *               audience_type:
 *                 type: string
 *                 enum: [full_class, specific_students, all_teachers]
 *                 description: Required — drives recipient resolution
 *               class_id:
 *                 type: string
 *                 format: uuid
 *                 description: Required if audience_type=full_class or specific_students
 *               recipient_ids:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 description: Required if audience_type=specific_students
 *               is_important:
 *                 type: boolean
 *                 default: false
 *               scope:
 *                 type: string
 *                 enum: [Whole School, By Class, Specific Users]
 *                 default: Whole School
 *                 description: Display label only — actual targeting uses audience_type
 *     responses:
 *       201:
 *         description: Announcement sent
 *   delete:
 *     tags: [Admin - Announcements]
 *     summary: Delete all announcements
 *     responses:
 *       200:
 *         description: Deleted
 */

/**
 * @swagger
 * /api/v1/academic/admin/announcements/save-draft:
 *   post:
 *     tags: [Admin - Announcements]
 *     summary: Save announcement as draft
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Draft saved
 */

/**
 * @swagger
 * /api/v1/academic/admin/announcements/{id}:
 *   get:
 *     tags: [Admin - Announcements]
 *     summary: Get announcement by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Announcement details
 *   put:
 *     tags: [Admin - Announcements]
 *     summary: Update announcement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Draft, Sent]
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Announcements]
 *     summary: Delete announcement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

/**
 * @swagger
 * /api/v1/academic/admin/announcements/templates:
 *   get:
 *     tags: [Admin - Announcements]
 *     summary: Get all announcement templates
 *     responses:
 *       200:
 *         description: Template list
 *   post:
 *     tags: [Admin - Announcements]
 *     summary: Create announcement template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template created
 */

/**
 * @swagger
 * /api/v1/academic/admin/announcements/templates/{templateId}:
 *   get:
 *     tags: [Admin - Announcements]
 *     summary: Get template by ID
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Template details
 *   patch:
 *     tags: [Admin - Announcements]
 *     summary: Update template
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Announcements]
 *     summary: Delete template
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - SETTINGS (School Profile)
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/settings/school-profile:
 *   get:
 *     tags: [Admin - Settings]
 *     summary: Get school profile
 *     responses:
 *       200:
 *         description: School profile
 *   post:
 *     tags: [Admin - Settings]
 *     summary: Create school profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               school_name:
 *                 type: string
 *               principal_name:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               established_year:
 *                 type: integer
 *               address:
 *                 type: string
 *               affiliation_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profile created
 *   patch:
 *     tags: [Admin - Settings]
 *     summary: Update school profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               school_name:
 *                 type: string
 *               principal_name:
 *                 type: string
 *               contact_email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Admin - Settings]
 *     summary: Delete school profile
 *     responses:
 *       200:
 *         description: Deleted
 */

// ============================================================
// ADMIN - TEACHER EDIT REQUESTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/teacher-edit-requests:
 *   get:
 *     tags: [Admin - Teacher Edit Requests]
 *     summary: Get all teacher edit requests
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Edit request list
 */

/**
 * @swagger
 * /api/v1/academic/admin/teacher-edit-requests/stats:
 *   get:
 *     tags: [Admin - Teacher Edit Requests]
 *     summary: Get edit request counts by status
 *     responses:
 *       200:
 *         description: Stats (pending, approved, rejected counts)
 */

/**
 * @swagger
 * /api/v1/academic/admin/teacher-edit-requests/{requestId}:
 *   get:
 *     tags: [Admin - Teacher Edit Requests]
 *     summary: Get edit request by ID
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Request details with changed fields
 */

/**
 * @swagger
 * /api/v1/academic/admin/teacher-edit-requests/{requestId}/approve:
 *   patch:
 *     tags: [Admin - Teacher Edit Requests]
 *     summary: Approve teacher edit request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Approved — teacher record updated with requested changes
 */

/**
 * @swagger
 * /api/v1/academic/admin/teacher-edit-requests/{requestId}/reject:
 *   patch:
 *     tags: [Admin - Teacher Edit Requests]
 *     summary: Reject teacher edit request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rejected
 */

// ============================================================
// ADMIN - MASTER DATA (Lookups for FE dropdowns)
// ============================================================
// Generic CRUD over reference tables. The {resource} path param picks
// the table:
//   blood-groups, license-types, school-classes, departments,
//   enquiry-sources, sections, subjects, staff-roles,
//   staff-departments, staff-positions
//
// All routes require ADMIN role. Tenant-scoped resources (everything
// except blood-groups and license-types) are filtered by school_id
// taken from the JWT.

/**
 * @swagger
 * /api/v1/academic/admin/lookups/all:
 *   get:
 *     tags: [Admin - Master Data]
 *     summary: "[One-shot] Fetch every lookup resource in a single call"
 *     description: |
 *       Returns every reference table (blood groups, classes, departments,
 *       sections, subjects, staff roles/depts/positions, license types,
 *       enquiry sources) in one response — normalised to `{id, name, order_number}`.
 *
 *       Use this to populate all FE dropdowns in one bootstrap call, or to
 *       grab every UUID you need while testing endpoints in Swagger. Keep
 *       the response open in another tab and copy-paste IDs from it.
 *     responses:
 *       200:
 *         description: Every lookup table keyed by slug
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     blood-groups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:           { type: string, format: uuid }
 *                           name:         { type: string, example: "A+" }
 *                           order_number: { type: integer, example: 3 }
 *                     school-classes:       { type: array, items: { type: object } }
 *                     departments:          { type: array, items: { type: object } }
 *                     enquiry-sources:      { type: array, items: { type: object } }
 *                     sections:             { type: array, items: { type: object } }
 *                     subjects:             { type: array, items: { type: object } }
 *                     staff-roles:          { type: array, items: { type: object } }
 *                     staff-departments:    { type: array, items: { type: object } }
 *                     staff-positions:      { type: array, items: { type: object } }
 *                     license-types:        { type: array, items: { type: object } }
 */

/**
 * @swagger
 * /api/v1/academic/admin/lookups/{resource}:
 *   get:
 *     tags: [Admin - Master Data]
 *     summary: List all entries for a lookup resource
 *     description: |
 *       Returns every row of the given reference table, ordered by
 *       order_number (or by name if the table doesn't track order).
 *
 *       Use this in FE dropdowns to fetch options like blood groups,
 *       departments, classes, subjects, etc. — and use the returned `id`
 *       as the FK value in admission/teacher/staff create endpoints.
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         description: Lookup resource slug
 *         schema:
 *           type: string
 *           enum:
 *             - blood-groups
 *             - license-types
 *             - school-classes
 *             - departments
 *             - enquiry-sources
 *             - sections
 *             - subjects
 *             - staff-roles
 *             - staff-departments
 *             - staff-positions
 *     responses:
 *       200:
 *         description: Array of lookup rows
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count:   { type: integer, example: 8 }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: string, format: uuid }
 *                       blood_group:  { type: string, example: "A+" }
 *                       order_number: { type: integer, example: 3 }
 *       404:
 *         description: Unknown resource slug
 *   post:
 *     tags: [Admin - Master Data]
 *     summary: Create a new entry in a lookup resource
 *     description: |
 *       The `name` field maps to the resource's name column automatically:
 *         - blood-groups → blood_group
 *         - school-classes → class_name
 *         - departments → department_name
 *         - enquiry-sources → source_name
 *         - sections → section_name
 *         - subjects → subject_name
 *         - staff-roles → role_name
 *         - staff-departments → department_name
 *         - staff-positions → position_name
 *         - license-types → license_name
 *
 *       You can pass either `name` or the actual column name in the body —
 *       both work.
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:         { type: string, example: "Computer Science" }
 *               order_number: { type: integer, example: 11 }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error (missing name)
 *       409:
 *         description: Duplicate (name already exists for this school)
 */

/**
 * @swagger
 * /api/v1/academic/admin/lookups/{resource}/{id}:
 *   get:
 *     tags: [Admin - Master Data]
 *     summary: Get a single lookup row by ID
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The lookup row
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Admin - Master Data]
 *     summary: Update a lookup row
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:         { type: string, example: "Updated Name" }
 *               order_number: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       409:
 *         description: Duplicate name
 *   delete:
 *     tags: [Admin - Master Data]
 *     summary: Delete a lookup row
 *     description: |
 *       Returns 409 if the row is referenced by a foreign key (e.g. trying
 *       to delete a department that's already assigned to teachers).
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 *       409:
 *         description: In use — cannot delete
 */

// ============================================================
// ADMIN - TIMETABLE
// ============================================================

/**
 * @swagger
 * /api/v1/academic/admin/timetable/period-config:
 *   get:
 *     tags: [Admin - Timetable]
 *     summary: Get period config for a class (settings modal)
 *     description: Returns all time slots (periods + breaks) configured for the given class. Applies to all sections of that class.
 *     parameters:
 *       - in: query
 *         name: class_name
 *         required: true
 *         schema:
 *           type: string
 *           example: Class 12
 *     responses:
 *       200:
 *         description: Period config list
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - period_number: 1
 *                   label: Period 1
 *                   is_break: false
 *                   start_time: "08:00:00"
 *                   end_time: "08:45:00"
 *                 - period_number: 4
 *                   label: Lunch Break
 *                   is_break: true
 *                   start_time: "10:15:00"
 *                   end_time: "10:45:00"
 *   put:
 *     tags: [Admin - Timetable]
 *     summary: Save period config for a class (replaces existing)
 *     description: Replaces all period/break slots for the class. Run this before filling the timetable grid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_name, periods]
 *             properties:
 *               class_name:
 *                 type: string
 *                 example: Class 12
 *               periods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [period_number, label, is_break, start_time, end_time]
 *                   properties:
 *                     period_number:
 *                       type: integer
 *                       example: 1
 *                     label:
 *                       type: string
 *                       example: Period 1
 *                     is_break:
 *                       type: boolean
 *                       example: false
 *                     start_time:
 *                       type: string
 *                       example: "08:00"
 *                     end_time:
 *                       type: string
 *                       example: "08:45"
 *           example:
 *             class_name: Class 12
 *             periods:
 *               - { period_number: 1, label: "Period 1",    is_break: false, start_time: "08:00", end_time: "08:45" }
 *               - { period_number: 2, label: "Period 2",    is_break: false, start_time: "08:45", end_time: "09:30" }
 *               - { period_number: 3, label: "Period 3",    is_break: false, start_time: "09:30", end_time: "10:15" }
 *               - { period_number: 4, label: "Lunch Break", is_break: true,  start_time: "10:15", end_time: "10:45" }
 *               - { period_number: 5, label: "Period 4",    is_break: false, start_time: "10:45", end_time: "11:30" }
 *               - { period_number: 6, label: "Period 5",    is_break: false, start_time: "11:30", end_time: "12:15" }
 *               - { period_number: 7, label: "Period 6",    is_break: false, start_time: "12:15", end_time: "13:00" }
 *     responses:
 *       200:
 *         description: Config saved
 */

/**
 * @swagger
 * /api/v1/academic/admin/timetable:
 *   get:
 *     tags: [Admin - Timetable]
 *     summary: Get timetable grid for a class+section
 *     description: >
 *       Returns the full weekly grid (all 6 days) or a single day if `day` is provided.
 *       Each slot is merged with period config — shows subject+teacher if filled, null if empty.
 *       Status is DRAFT until admin publishes.
 *     parameters:
 *       - in: query
 *         name: class_name
 *         required: true
 *         schema:
 *           type: string
 *           example: Class 12
 *       - in: query
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           example: A
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
 *         description: Optional — omit for full week
 *     responses:
 *       200:
 *         description: Timetable grid
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 class_name: Class 12
 *                 section: A
 *                 status: PUBLISHED
 *                 grid:
 *                   Monday:
 *                     - period_number: 1
 *                       label: Period 1
 *                       is_break: false
 *                       start_time: "08:00:00"
 *                       end_time: "08:45:00"
 *                       subject: Mathematics
 *                       teacher_id: "uuid"
 *                       teacher_name: Vijay S
 *                       status: PUBLISHED
 *                     - period_number: 4
 *                       label: Lunch Break
 *                       is_break: true
 *                       start_time: "10:15:00"
 *                       end_time: "10:45:00"
 *                       subject: null
 *                       teacher_id: null
 *                       teacher_name: null
 *                       status: DRAFT
 */

/**
 * @swagger
 * /api/v1/academic/admin/timetable/period:
 *   put:
 *     tags: [Admin - Timetable]
 *     summary: Save a single cell (Edit Period modal)
 *     description: Upserts subject + teacher for one period slot. Period config must exist first. Sets status to DRAFT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_name, section, day_of_week, period_number, subject]
 *             properties:
 *               class_name:    { type: string, example: Class 12 }
 *               section:       { type: string, example: A }
 *               day_of_week:   { type: string, example: Monday }
 *               period_number: { type: integer, example: 1 }
 *               subject:       { type: string, example: Mathematics }
 *               teacher_id:    { type: string, format: uuid, description: Optional }
 *     responses:
 *       200:
 *         description: Period saved
 *       400:
 *         description: Period number not in config / invalid day / missing fields
 *   delete:
 *     tags: [Admin - Timetable]
 *     summary: Clear a single cell
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_name, section, day_of_week, period_number]
 *             properties:
 *               class_name:    { type: string, example: Class 12 }
 *               section:       { type: string, example: A }
 *               day_of_week:   { type: string, example: Monday }
 *               period_number: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Period deleted
 */

/**
 * @swagger
 * /api/v1/academic/admin/timetable/publish:
 *   post:
 *     tags: [Admin - Timetable]
 *     summary: Publish timetable — teachers and parents can now see it
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_name, section]
 *             properties:
 *               class_name: { type: string, example: Class 12 }
 *               section:    { type: string, example: A }
 *     responses:
 *       200:
 *         description: Timetable published
 */

/**
 * @swagger
 * /api/v1/academic/admin/timetable/unpublish:
 *   post:
 *     tags: [Admin - Timetable]
 *     summary: Unpublish timetable — sets back to DRAFT, hidden from teachers and parents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_name, section]
 *             properties:
 *               class_name: { type: string, example: Class 12 }
 *               section:    { type: string, example: A }
 *     responses:
 *       200:
 *         description: Timetable unpublished
 */

// ─────────────────────────────────────────────────────────────────────────
// Admin - Class Templates
// ─────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/academic/admin/class-templates:
 *   get:
 *     tags: [Admin - Class Templates]
 *     summary: List global class templates (dropdown source for Add New Class popup)
 *     description: >
 *       Read-only catalogue of classes that every school can pick from. Seeded with
 *       Nursery → Class 12. Future super-admin portal will CRUD this list.
 *     responses:
 *       200:
 *         description: Template list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: string, format: uuid }
 *                       class_name:   { type: string, example: Class 1 }
 *                       order_number: { type: integer, example: 4 }
 *       403: { description: Forbidden — admins only }
 */

// ─────────────────────────────────────────────────────────────────────────
// Admin - Section Templates
// ─────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/academic/admin/section-templates:
 *   get:
 *     tags: [Admin - Section Templates]
 *     summary: List global section templates (chip source for Add New Class popup)
 *     description: >
 *       Read-only catalogue of sections that every school can pick from. Seeded with
 *       A-F, A1-A5, B1-B5, and colour houses. `is_default=true` means the section
 *       is auto-attached to every new class and cannot be detached.
 *       Sections must be attached in `order_number` sequence — no gaps allowed
 *       (see `/admin/classes` endpoints).
 *     responses:
 *       200:
 *         description: Template list in canonical order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: string, format: uuid }
 *                       section_name: { type: string, example: A }
 *                       order_number: { type: integer, example: 1 }
 *                       is_default:   { type: boolean, example: true }
 *       403: { description: Forbidden — admins only }
 */

// ─────────────────────────────────────────────────────────────────────────
// Admin - Classes (Add New Class popup + per-class section CRUD)
// ─────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/academic/admin/classes:
 *   post:
 *     tags: [Admin - Classes]
 *     summary: Add a new class with sections (Add New Class popup submit)
 *     description: >
 *       Creates a school_classes row from the picked class template and attaches
 *       sections atomically.
 *
 *       Rules:
 *       - Defaults A, B, C, D are **always auto-attached** regardless of payload.
 *       - `section_template_ids` is OPTIONAL. Any IDs you pass are added on top
 *         of the defaults.
 *       - The resulting set must form a **contiguous prefix** of the
 *         `section_templates` order. You cannot pick F without E, or Red without
 *         everything before it. Violations return 400 `SECTION_ORDER_VIOLATION`.
 *       - Idempotent: re-submitting the same payload is a no-op.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_template_id]
 *             properties:
 *               class_template_id:
 *                 type: string
 *                 format: uuid
 *                 description: From GET /admin/class-templates
 *               section_template_ids:
 *                 type: array
 *                 description: Optional extras on top of the A/B/C/D defaults
 *                 items: { type: string, format: uuid }
 *           examples:
 *             minimal:
 *               summary: Just a class — defaults A,B,C,D auto-attach
 *               value: { class_template_id: "uuid-of-class-1" }
 *             withExtras:
 *               summary: Class 1 + E and Red
 *               value:
 *                 class_template_id: "uuid-of-class-1"
 *                 section_template_ids: ["uuid-of-E", "uuid-of-Red"]
 *     responses:
 *       200:
 *         description: Class created (or updated idempotently)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Class created }
 *                 data:
 *                   type: object
 *                   properties:
 *                     class:
 *                       type: object
 *                       properties:
 *                         id:          { type: string, format: uuid }
 *                         class_name:  { type: string, example: Class 1 }
 *                         template_id: { type: string, format: uuid }
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:                  { type: string, format: uuid }
 *                           section_template_id: { type: string, format: uuid }
 *                           section_name:        { type: string, example: A }
 *                           is_default:          { type: boolean, example: true }
 *       400:
 *         description: |
 *           Validation error. Possible codes:
 *           - `VALIDATION_ERROR` — missing class_template_id
 *           - `INVALID_SECTION_TEMPLATE` — one of the section IDs doesn't exist
 *           - `SECTION_ORDER_VIOLATION` — selection is not a contiguous prefix
 *       403: { description: Forbidden — admins only }
 *       404: { description: Class template not found }
 *
 *   get:
 *     tags: [Admin - Classes]
 *     summary: List all classes at this school with section counts
 *     responses:
 *       200:
 *         description: Class list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:            { type: string, format: uuid }
 *                       class_name:    { type: string, example: Class 1 }
 *                       template_id:   { type: string, format: uuid, nullable: true }
 *                       section_count: { type: integer, example: 4 }
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes/structure:
 *   post:
 *     tags: [Admin - Classes]
 *     summary: Bulk-save class structure (apply one section list to many classes)
 *     description: >
 *       Atomic bulk upsert. For every `class_template_id` in the payload:
 *
 *       1. Upserts a `school_classes` row from the matching `class_templates` entry.
 *       2. Replaces that class's `class_sections` to **exactly match** `section_template_ids`
 *          (detaches extras, attaches missing ones).
 *
 *       Same section list applies to every selected class. Empty `section_template_ids`
 *       is valid and clears all sections for the selected classes.
 *
 *       Used by the Settings page "Manage Class & Section Structure" bulk modal.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_template_ids]
 *             properties:
 *               class_template_ids:
 *                 type: array
 *                 minItems: 1
 *                 items: { type: string, format: uuid }
 *                 description: One or more class_template UUIDs to onboard.
 *               section_template_ids:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 description: Section template UUIDs to apply to every selected class.
 *           examples:
 *             withSections:
 *               value:
 *                 class_template_ids: ["uuid-class-1", "uuid-class-2"]
 *                 section_template_ids: ["uuid-A", "uuid-B", "uuid-C", "uuid-D"]
 *             clearSections:
 *               value:
 *                 class_template_ids: ["uuid-class-1"]
 *                 section_template_ids: []
 *     responses:
 *       200:
 *         description: Per-class result with the freshly-built section list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Class structure saved }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           class_name: { type: string, example: Class 1 }
 *                           template_id: { type: string, format: uuid }
 *                           order_number: { type: integer, example: 4 }
 *                       sections:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: { type: string, format: uuid }
 *                             section_template_id: { type: string, format: uuid }
 *                             section_name: { type: string, example: A }
 *                             is_default: { type: boolean }
 *       400:
 *         description: >
 *           Validation error. Codes:
 *           - `VALIDATION_ERROR` — empty or missing `class_template_ids`
 *           - `INVALID_TEMPLATE` — one or more UUIDs don't exist or aren't active
 *       403: { description: Not an admin }
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes/{classId}/sections:
 *   get:
 *     tags: [Admin - Classes]
 *     summary: List sections attached to one class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Sections in order, each with `is_default` flag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:                  { type: string, format: uuid }
 *                       section_template_id: { type: string, format: uuid }
 *                       section_name:        { type: string, example: A }
 *                       is_default:          { type: boolean, example: true }
 *       404: { description: Class not found for this school }
 *
 *   post:
 *     tags: [Admin - Classes]
 *     summary: Attach the next-in-order section to a class
 *     description: >
 *       The `section_template_id` must correspond to the single section template
 *       at index = current_attached_count (see GET /sections/next-available).
 *       Violations return 400 `SECTION_ORDER_VIOLATION`.
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [section_template_id]
 *             properties:
 *               section_template_id: { type: string, format: uuid }
 *     responses:
 *       200: { description: Section attached }
 *       400:
 *         description: |
 *           - `INVALID_SECTION_TEMPLATE`
 *           - `SECTION_ORDER_VIOLATION`
 *       404: { description: Class not found }
 *       409: { description: Section already attached }
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes/{classId}/sections/next-available:
 *   get:
 *     tags: [Admin - Classes]
 *     summary: The single section template admin can attach next
 *     description: >
 *       Returns the section_templates row at index = current attached count.
 *       FE uses this to render a single "Add next section" button, guaranteeing
 *       the attach payload won't violate the contiguous-prefix rule. Returns
 *       `null` once every active template is attached.
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Next template (or null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   oneOf:
 *                     - type: 'null'
 *                     - type: object
 *                       properties:
 *                         id:           { type: string, format: uuid }
 *                         section_name: { type: string, example: E }
 *                         order_number: { type: integer, example: 5 }
 *                         is_default:   { type: boolean, example: false }
 *       404: { description: Class not found }
 */

/**
 * @swagger
 * /api/v1/academic/admin/classes/{classId}/sections/{classSectionId}:
 *   delete:
 *     tags: [Admin - Classes]
 *     summary: Detach the tail section from a class
 *     description: >
 *       Only the last-attached section can be detached (keeps the attached set
 *       as a contiguous prefix). Default sections A, B, C, D are locked and
 *       cannot be detached.
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: classSectionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Section detached }
 *       400:
 *         description: |
 *           - `DEFAULT_SECTION_LOCKED` — tried to remove A/B/C/D
 *           - `SECTION_ORDER_VIOLATION` — tried to detach a non-tail section
 *       404: { description: Class or section not found }
 */
