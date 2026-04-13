// ============================================================
// TEACHER - ATTENDANCE
// ============================================================

/**
 * @swagger
 * /api/v1/academic/teacher/classes:
 *   get:
 *     tags: [Teacher - Attendance]
 *     summary: Get teacher's assigned classes
 *     responses:
 *       200:
 *         description: List of classes
 */

/**
 * @swagger
 * /api/v1/academic/classes/{classId}/students:
 *   get:
 *     tags: [Teacher - Attendance]
 *     summary: Get students of a class with attendance status for a date
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03-03"
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Student list with attendance status (null if not marked)
 */

/**
 * @swagger
 * /api/v1/academic/attendance-statuses:
 *   get:
 *     tags: [Teacher - Attendance]
 *     summary: Get active attendance statuses for the school
 *     responses:
 *       200:
 *         description: List of statuses (PRESENT, ABSENT, LATE, HALF_DAY)
 */

/**
 * @swagger
 * /api/v1/academic/attendance/submit:
 *   post:
 *     tags: [Teacher - Attendance]
 *     summary: Submit attendance for a class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_id, attendance_date, attendance]
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               attendance_date:
 *                 type: string
 *                 example: "2026-03-03"
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *     responses:
 *       201:
 *         description: Attendance submitted successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/academic/classes/{classId}/attendance:
 *   get:
 *     tags: [Teacher - Attendance]
 *     summary: Get attendance history for a date range
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: from_date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03-01"
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03-31"
 *     responses:
 *       200:
 *         description: Attendance records grouped by date
 */

/**
 * @swagger
 * /api/v1/academic/students/{studentId}/attendance-summary:
 *   get:
 *     tags: [Teacher - Attendance]
 *     summary: Get attendance summary for a student (counts + percentage)
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Summary with total, present, absent, late, half_day, percentage
 */

/**
 * @swagger
 * /api/v1/academic/classes/{classId}/attendance-report:
 *   get:
 *     tags: [Teacher - Attendance]
 *     summary: Get monthly attendance report for a class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03"
 *         description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: Per-student attendance breakdown with percentages
 */

/**
 * @swagger
 * /api/v1/academic/attendance/{recordId}:
 *   patch:
 *     tags: [Teacher - Attendance]
 *     summary: Update an attendance record's status
 *     parameters:
 *       - in: path
 *         name: recordId
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
 *                 enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *     responses:
 *       200:
 *         description: Record updated with old_status and new_status
 *   delete:
 *     tags: [Teacher - Attendance]
 *     summary: Delete an attendance record
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */

// ============================================================
// TEACHER - HOMEWORK
// ============================================================

/**
 * @swagger
 * /api/v1/academic/homework:
 *   get:
 *     tags: [Teacher - Homework]
 *     summary: List homework assignments
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [today, upcoming, completed]
 *           default: today
 *     responses:
 *       200:
 *         description: List of homework assignments
 *   post:
 *     tags: [Teacher - Homework]
 *     summary: Create a new homework assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_id, subject, title, description, due_date]
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               title:
 *                 type: string
 *                 example: "Chapter 5 Exercise"
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 example: "2026-03-20"
 *     responses:
 *       201:
 *         description: Homework created
 */

/**
 * @swagger
 * /api/v1/academic/classes/{classId}/homework:
 *   get:
 *     tags: [Teacher - Homework]
 *     summary: Get homework for a specific class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Homework list for the class
 */

// ============================================================
// TEACHER - TIMETABLE
// ============================================================

/**
 * @swagger
 * /api/v1/academic/timetable:
 *   get:
 *     tags: [Teacher - Timetable]
 *     summary: Get teacher's timetable (periods for a day + next class)
 *     parameters:
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
 *     responses:
 *       200:
 *         description: Timetable with periods, subjects, and time slots
 */

/**
 * @swagger
 * /api/v1/academic/classes/{classId}/detail:
 *   get:
 *     tags: [Teacher - Timetable]
 *     summary: Get class detail (header info + recent activity)
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Class details with student count and recent activity
 */

// ============================================================
// TEACHER - ANNOUNCEMENTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/announcements:
 *   get:
 *     tags: [Teacher - Announcements]
 *     summary: List announcements (inbox or sent)
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [inbox, sent]
 *           default: inbox
 *     responses:
 *       200:
 *         description: List of announcements
 *   post:
 *     tags: [Teacher - Announcements]
 *     summary: Send a new announcement to parents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [class_id, audience_type, message]
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               audience_type:
 *                 type: string
 *                 enum: [full_class, specific_students]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               is_important:
 *                 type: boolean
 *                 default: false
 *               recipient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required when audience_type is specific_students
 *     responses:
 *       201:
 *         description: Announcement sent
 */

/**
 * @swagger
 * /api/v1/academic/announcements/{announcementId}:
 *   get:
 *     tags: [Teacher - Announcements]
 *     summary: Get announcement detail
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Announcement with recipient details
 */

// ============================================================
// TEACHER - LEAVE
// ============================================================

/**
 * @swagger
 * /api/v1/academic/leave-requests:
 *   get:
 *     tags: [Teacher - Leave]
 *     summary: List leave requests
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *     responses:
 *       200:
 *         description: List of leave requests
 */

/**
 * @swagger
 * /api/v1/academic/leave-requests/{leaveId}:
 *   patch:
 *     tags: [Teacher - Leave]
 *     summary: Approve or reject a leave request
 *     parameters:
 *       - in: path
 *         name: leaveId
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
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Leave request updated
 */

// ============================================================
// TEACHER - EXAMS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/exams:
 *   get:
 *     tags: [Teacher - Exams]
 *     summary: List exams by status tab
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed]
 *           default: upcoming
 *     responses:
 *       200:
 *         description: List of exams
 */

/**
 * @swagger
 * /api/v1/academic/exams/{examSubjectId}/marks:
 *   get:
 *     tags: [Teacher - Exams]
 *     summary: Get student list for marks entry
 *     parameters:
 *       - in: path
 *         name: examSubjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Students with current marks (if draft)
 *       400:
 *         description: Exam not completed yet or already submitted
 *   post:
 *     tags: [Teacher - Exams]
 *     summary: Save marks (draft or final submit)
 *     parameters:
 *       - in: path
 *         name: examSubjectId
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
 *             required: [action, marks]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [draft, submit]
 *               marks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: string
 *                       format: uuid
 *                     marks_obtained:
 *                       type: number
 *                       example: 85
 *                     is_absent:
 *                       type: boolean
 *                       default: false
 *     responses:
 *       200:
 *         description: Marks saved
 *       400:
 *         description: Validation error or already submitted
 */

// ============================================================
// TEACHER - CHECK-IN
// ============================================================

/**
 * @swagger
 * /api/v1/academic/teacher/checkin/status:
 *   get:
 *     tags: [Teacher - Check-in]
 *     summary: Get today's check-in status
 *     responses:
 *       200:
 *         description: Check-in status (checked in or not)
 */

/**
 * @swagger
 * /api/v1/academic/teacher/checkin:
 *   post:
 *     tags: [Teacher - Check-in]
 *     summary: Mark self check-in with GPS location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 12.9716
 *               longitude:
 *                 type: number
 *                 example: 77.5946
 *     responses:
 *       200:
 *         description: Check-in recorded (ON_TIME or LATE)
 *       400:
 *         description: Outside campus geofence
 */

// ============================================================
// TEACHER - WORK DETAILS & PROFILE
// ============================================================

/**
 * @swagger
 * /api/v1/academic/teacher/my-work-details:
 *   get:
 *     tags: [Teacher - Work Details]
 *     summary: Get logged-in teacher's profile and work summary
 *     description: Returns personal info, assigned classes, and student counts for the authenticated teacher.
 *     responses:
 *       200:
 *         description: Teacher profile with work summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         designation:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         date_of_joining:
 *                           type: string
 *                           format: date
 *                     work_summary:
 *                       type: object
 *                       properties:
 *                         total_classes:
 *                           type: integer
 *                         total_students:
 *                           type: integer
 *                     assigned_classes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           section:
 *                             type: string
 *                           student_count:
 *                             type: integer
 */

// ============================================================
// TEACHER - EDIT REQUESTS
// ============================================================

/**
 * @swagger
 * /api/v1/academic/teacher/edit-requests:
 *   get:
 *     tags: [Teacher - Edit Requests]
 *     summary: Get my profile edit requests
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: List of edit requests
 *   post:
 *     tags: [Teacher - Edit Requests]
 *     summary: Request a profile field change (requires admin approval)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [changed_fields]
 *             properties:
 *               changed_fields:
 *                 type: object
 *                 description: Key-value pairs of fields to change
 *                 example:
 *                   primary_phone: "9876543210"
 *                   primary_email: "newemail@school.com"
 *               reason:
 *                 type: string
 *                 example: Updated contact details
 *     responses:
 *       201:
 *         description: Edit request submitted — pending admin approval
 */

/**
 * @swagger
 * /api/v1/academic/teacher/edit-requests/{requestId}:
 *   get:
 *     tags: [Teacher - Edit Requests]
 *     summary: Get a specific edit request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Edit request details
 *   delete:
 *     tags: [Teacher - Edit Requests]
 *     summary: Cancel a pending edit request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cancelled
 */
