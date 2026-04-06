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
