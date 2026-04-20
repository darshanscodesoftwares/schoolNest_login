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
 * /api/v1/parent/students/{studentId}/timetable:
 *   get:
 *     tags: [Parent - Timetable]
 *     summary: Get child's daily schedule with breaks
 *     description: >
 *       Returns the PUBLISHED timetable for the given student on the specified day.
 *       Defaults to today if `day` is omitted. Break entries are automatically inserted
 *       between periods wherever a gap exists. Only PUBLISHED timetables are visible —
 *       if admin hasn't published yet, `schedule` will be empty.
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
 *         description: Day to fetch. Defaults to today.
 *     responses:
 *       200:
 *         description: Student's schedule for the day including breaks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 student:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: Rohit Kumar
 *                 day:
 *                   type: string
 *                   example: Monday
 *                 total_periods:
 *                   type: integer
 *                   description: Count of teaching periods only (breaks excluded)
 *                   example: 6
 *                 schedule:
 *                   type: array
 *                   description: Ordered list of periods and breaks for the day
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [period, break]
 *                         description: Use this to decide card style — break = yellow card
 *                       period_number:
 *                         type: integer
 *                         nullable: true
 *                         description: null for break entries
 *                         example: 1
 *                       subject:
 *                         type: string
 *                         description: Subject name for periods, "Break" for breaks
 *                         example: Mathematics
 *                       start_time:
 *                         type: string
 *                         example: "08:00:00"
 *                       end_time:
 *                         type: string
 *                         example: "08:45:00"
 *                       duration_minutes:
 *                         type: integer
 *                         example: 45
 *                       day_of_week:
 *                         type: string
 *                         example: Monday
 *             example:
 *               success: true
 *               student:
 *                 id: "uuid"
 *                 name: "Rohit Kumar"
 *               day: "Monday"
 *               total_periods: 6
 *               schedule:
 *                 - type: period
 *                   period_number: 1
 *                   subject: Mathematics
 *                   start_time: "08:00:00"
 *                   end_time: "08:45:00"
 *                   duration_minutes: 45
 *                   day_of_week: Monday
 *                 - type: period
 *                   period_number: 2
 *                   subject: English
 *                   start_time: "08:45:00"
 *                   end_time: "09:30:00"
 *                   duration_minutes: 45
 *                   day_of_week: Monday
 *                 - type: break
 *                   period_number: null
 *                   subject: Break
 *                   start_time: "10:15:00"
 *                   end_time: "10:45:00"
 *                   duration_minutes: 30
 *                   day_of_week: Monday
 *       400:
 *         description: Invalid day value
 *       403:
 *         description: Student does not belong to this parent
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

// ============================================================
// PARENT - RESULTS
// ============================================================

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/results/exams:
 *   get:
 *     tags: [Parent - Results]
 *     summary: List all exams for a student's class
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of exams with subjects
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/results/{examId}:
 *   get:
 *     tags: [Parent - Results]
 *     summary: Get detailed result for a specific exam
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subject-wise marks with pass/fail status
 */

// ============================================================
// PARENT - FEES
// ============================================================

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/fees:
 *   get:
 *     tags: [Parent - Fees]
 *     summary: Get child's fees summary and breakdown
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fee summary (total, paid, remaining) + individual fee details
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/fees/history:
 *   get:
 *     tags: [Parent - Fees]
 *     summary: Get child's payment history
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of all payment attempts (successful and failed)
 */
