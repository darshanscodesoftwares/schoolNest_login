// ============================================================
// PARENT - ATTENDANCE
// ============================================================

/**
 * @swagger
 * /api/v1/parent/students:
 *   get:
 *     tags: [Parent - Attendance]
 *     summary: Get parent's children list
 *     responses:
 *       200:
 *         description: List of students linked to parent
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/attendance/summary:
 *   get:
 *     tags: [Parent - Attendance]
 *     summary: Get child's attendance summary
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Attendance summary with counts and percentage
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/attendance/month:
 *   get:
 *     tags: [Parent - Attendance]
 *     summary: Get child's monthly attendance
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2026-03"
 *         description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: Day-wise attendance for the month
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/attendance/recent:
 *   get:
 *     tags: [Parent - Attendance]
 *     summary: Get child's recent attendance
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recent attendance records
 */

// ============================================================
// PARENT - HOMEWORK
// ============================================================

/**
 * @swagger
 * /api/v1/parent/homework:
 *   get:
 *     tags: [Parent - Homework]
 *     summary: Get homework for parent's children
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [today, upcoming]
 *           default: today
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific child
 *     responses:
 *       200:
 *         description: Homework list for children
 */

// ============================================================
// PARENT - TIMETABLE
// ============================================================

/**
 * @swagger
 * /api/v1/academic/parent/students/{studentId}/timetable:
 *   get:
 *     tags: [Parent - Timetable]
 *     summary: Get child's timetable
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
 *     responses:
 *       200:
 *         description: Student's timetable for the day
 */

// ============================================================
// PARENT - ANNOUNCEMENTS
// ============================================================

/**
 * @swagger
 * /api/v1/parent/announcements:
 *   get:
 *     tags: [Parent - Announcements]
 *     summary: List announcements for parent
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [all, important]
 *           default: all
 *     responses:
 *       200:
 *         description: List of announcements
 */

/**
 * @swagger
 * /api/v1/parent/announcements/{announcementId}:
 *   get:
 *     tags: [Parent - Announcements]
 *     summary: Get announcement detail and mark as read
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Announcement details
 */

// ============================================================
// PARENT - LEAVE
// ============================================================

/**
 * @swagger
 * /api/v1/parent/leave:
 *   post:
 *     tags: [Parent - Leave]
 *     summary: Apply leave for child
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [student_id, from_date, to_date, reason]
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *               from_date:
 *                 type: string
 *                 example: "2026-03-20"
 *               to_date:
 *                 type: string
 *                 example: "2026-03-21"
 *               reason:
 *                 type: string
 *                 enum: [Sick, Family Function, Travel, Personal, Other]
 *               message:
 *                 type: string
 *                 example: "Child has fever"
 *     responses:
 *       201:
 *         description: Leave request submitted
 */

/**
 * @swagger
 * /api/v1/parent/leave/history:
 *   get:
 *     tags: [Parent - Leave]
 *     summary: View leave request history
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of leave requests with status
 */

