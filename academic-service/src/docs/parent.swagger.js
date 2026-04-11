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
// PARENT - TIMETABLE
// ============================================================

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/timetable:
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
 *     responses:
 *       200:
 *         description: Weekly class schedule
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
 *         description: Filter by tab (today or upcoming)
 *     responses:
 *       200:
 *         description: List of homework assignments for child's classes
 */

// ============================================================
// PARENT - RESULTS
// ============================================================

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/results/exams:
 *   get:
 *     tags: [Parent - Results]
 *     summary: Get list of exams for child's class
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of exams with summary of results
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/results/{examId}:
 *   get:
 *     tags: [Parent - Results]
 *     summary: Get child's detailed results for an exam
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
 *         description: Subject-wise marks and overall performance
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
