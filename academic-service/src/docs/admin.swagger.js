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
 *               student_name:
 *                 type: string
 *                 example: Ravi Kumar
 *               father_name:
 *                 type: string
 *                 example: Suresh Kumar
 *               contact_number:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: ravi@example.com
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               academic_year:
 *                 type: string
 *                 example: "2025-26"
 *               source_id:
 *                 type: string
 *                 format: uuid
 *               remarks:
 *                 type: string
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
 *     summary: Create admission draft
 *     responses:
 *       201:
 *         description: Draft created with admission ID
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
 * /api/v1/academic/admin/admissions/save-draft:
 *   post:
 *     tags: [Admin - Admissions]
 *     summary: Save draft with all sections in one call (multipart/form-data)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               nationality:
 *                 type: string
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               section:
 *                 type: string
 *               admission_date:
 *                 type: string
 *                 format: date
 *               father_full_name:
 *                 type: string
 *               father_phone:
 *                 type: string
 *               father_email:
 *                 type: string
 *               mother_full_name:
 *                 type: string
 *               mother_phone:
 *                 type: string
 *               student_photo:
 *                 type: string
 *                 format: binary
 *               birth_certificate:
 *                 type: string
 *                 format: binary
 *               aadhaar_card:
 *                 type: string
 *                 format: binary
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [first_name, date_of_birth, gender, nationality, date_of_joining]
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Priya
 *               last_name:
 *                 type: string
 *                 example: Sharma
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               nationality:
 *                 type: string
 *                 example: Indian
 *               date_of_joining:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               primary_email:
 *                 type: string
 *                 example: priya.sharma@school.com
 *               primary_phone:
 *                 type: string
 *                 example: "9876543210"
 *               designation:
 *                 type: string
 *                 example: Senior Teacher
 *               monthly_salary:
 *                 type: number
 *                 example: 35000
 *               teacher_photo:
 *                 type: string
 *                 format: binary
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               assign_date:
 *                 type: string
 *                 format: date
 *               license_number:
 *                 type: string
 *               primary_phone:
 *                 type: string
 *               employment_type:
 *                 type: string
 *                 enum: [Permanent, Contractual, Temporary]
 *               driver_photo:
 *                 type: string
 *                 format: binary
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [first_name]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               primary_email:
 *                 type: string
 *               primary_phone:
 *                 type: string
 *               employment_type:
 *                 type: string
 *                 enum: [Permanent, Contractual, Temporary]
 *               staff_photo:
 *                 type: string
 *                 format: binary
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
 *               exam_name:
 *                 type: string
 *                 example: Mid-Term 2026
 *               academic_year:
 *                 type: string
 *                 example: "2025-26"
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
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
 *                 example: School Closed Tomorrow
 *               message:
 *                 type: string
 *                 example: School will remain closed on 14th April due to public holiday.
 *               scope:
 *                 type: string
 *                 enum: [Whole School, By Class, Specific Users]
 *                 default: Whole School
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
