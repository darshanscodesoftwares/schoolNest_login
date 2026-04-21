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
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f3d218f8-0209-4c17-be43-0ab7386305f0
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
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f3d218f8-0209-4c17-be43-0ab7386305f0
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
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f3d218f8-0209-4c17-be43-0ab7386305f0
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
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f3d218f8-0209-4c17-be43-0ab7386305f0
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
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f3d218f8-0209-4c17-be43-0ab7386305f0
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
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f3d218f8-0209-4c17-be43-0ab7386305f0
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
 *     summary: Fees summary + per-fee breakdown for one child
 *     description: >
 *       Backs the Flutter Fees screen — three summary cards (Total / Paid /
 *       Remaining) plus the scrollable fee list (icon, name, due date, amount,
 *       status pill, optional Pay button).
 *
 *       **Date formats:** `due_date` is ISO `YYYY-MM-DD`. `paid_at` is the
 *       project's IST 12-hour string `YYYY-MM-DD hh:mm AM/PM` — not ISO-8601.
 *       Flutter needs a custom parser for it (shared across every timestamp in
 *       this service — see `academic-service/src/config/db.js`).
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema: { type: string, format: uuid, example: f3d218f8-0209-4c17-be43-0ab7386305f0 }
 *     responses:
 *       200:
 *         description: Fee summary + breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_fee: { type: number, example: 20000, description: "Sum of all fee amounts for this student" }
 *                     paid:      { type: number, example: 2000,  description: "Sum of amounts where status = 'PAID'" }
 *                     remaining: { type: number, example: 18000, description: "total_fee - paid" }
 *                 fees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:        { type: string, format: uuid }
 *                       fee_name:  { type: string, example: "Tuition Fee" }
 *                       icon:      { type: string, example: "book", description: "Asset key — current values: book, bus, edit. Flutter maps to its own icon set." }
 *                       amount:    { type: number, example: 15000, description: "In rupees (no paise). Display as ₹15,000." }
 *                       due_date:  { type: string, format: date, example: "2026-07-10" }
 *                       status:    { type: string, enum: [PENDING, PAID, OVERDUE], example: "PENDING" }
 *                       paid_at:
 *                         type: string
 *                         nullable: true
 *                         example: "2026-04-14 07:08 PM"
 *                         description: "IST 12-hour string (not ISO-8601). Null when status != PAID."
 *             examples:
 *               mobile-design:
 *                 summary: Matches the Fees screen mock (total ₹20,000 / 3 items)
 *                 value:
 *                   success: true
 *                   summary: { total_fee: 20000, paid: 2000, remaining: 18000 }
 *                   fees:
 *                     - { id: "uuid-1", fee_name: "Tuition Fee",   icon: "book", amount: 15000, due_date: "2026-07-10", status: "PENDING", paid_at: null }
 *                     - { id: "uuid-2", fee_name: "Transport Fee", icon: "bus",  amount: 3000,  due_date: "2026-07-10", status: "PENDING", paid_at: null }
 *                     - { id: "uuid-3", fee_name: "Exam Fee",      icon: "edit", amount: 2000,  due_date: "2026-07-15", status: "PAID",    paid_at: "2026-04-14 07:08 PM" }
 *       401: { description: Missing or invalid token }
 *       403: { description: Not a parent, or student does not belong to this parent }
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/fees/history:
 *   get:
 *     tags: [Parent - Fees]
 *     summary: Payment history for one child
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema: { type: string, format: uuid, example: f3d218f8-0209-4c17-be43-0ab7386305f0 }
 *     responses:
 *       200:
 *         description: Every payment recorded for this student, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:             { type: string, format: uuid }
 *                       fee_name:       { type: string, example: "Tuition Fee" }
 *                       amount:         { type: number, example: 15000 }
 *                       method:         { type: string, enum: [UPI, CARD, NET_BANKING, CASH], example: "UPI" }
 *                       transaction_id: { type: string, example: "TXN1776173920546752", description: "Dummy payments use a 'DUMMY' prefix until a real gateway is wired in." }
 *                       status:         { type: string, enum: [PAID, FAILED], example: "PAID" }
 *                       paid_at:        { type: string, example: "2026-04-14 07:08 PM" }
 *       401: { description: Missing or invalid token }
 *       403: { description: Not a parent, or student does not belong to this parent }
 */

/**
 * @swagger
 * /api/v1/parent/students/{studentId}/fees/{feeId}/pay:
 *   post:
 *     tags: [Parent - Fees]
 *     summary: Dummy UPI payment (dev only — no real gateway)
 *     description: >
 *       Flips the specified fee's status to PAID and inserts a matching row in
 *       `payments` with `method='UPI'` and a `transaction_id` prefixed
 *       `DUMMY<timestamp>`. Intended for the Flutter MVP while a real payment
 *       gateway (Razorpay / Cashfree / etc.) is pending.
 *
 *       Behaviour:
 *       - If the fee is already PAID → **409 FEE_ALREADY_PAID**.
 *       - If the fee doesn't exist for this student → **404 FEE_NOT_FOUND**.
 *       - Amount is read from the fee row; the client cannot override it.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         description: Aryan Kumar (Ravi's eldest) — pre-filled for Flutter testing
 *         schema: { type: string, format: uuid, example: f3d218f8-0209-4c17-be43-0ab7386305f0 }
 *       - in: path
 *         name: feeId
 *         required: true
 *         description: Aryan's pending Tuition Fee — change if already paid
 *         schema: { type: string, format: uuid, example: 1ccdd9a0-d4f3-4a37-82c2-1854e3c44f60 }
 *     responses:
 *       200:
 *         description: Payment recorded; returns the updated fee + the new payment row
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Payment recorded (dummy)" }
 *                 fee:
 *                   type: object
 *                   properties:
 *                     id:       { type: string, format: uuid }
 *                     fee_name: { type: string, example: "Tuition Fee" }
 *                     icon:     { type: string, example: "book" }
 *                     amount:   { type: number, example: 15000 }
 *                     status:   { type: string, enum: [PAID], example: "PAID" }
 *                     paid_at:  { type: string, example: "2026-04-14 07:08 PM" }
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:             { type: string, format: uuid }
 *                     amount:         { type: number, example: 15000 }
 *                     method:         { type: string, enum: [UPI], example: "UPI" }
 *                     transaction_id: { type: string, example: "DUMMY1776858900123456" }
 *                     status:         { type: string, enum: [PAID], example: "PAID" }
 *                     paid_at:        { type: string, example: "2026-04-14 07:08 PM" }
 *       404: { description: Fee not found for this student }
 *       409: { description: Fee is already paid }
 *       401: { description: Missing or invalid token }
 *       403: { description: Not a parent, or student does not belong to this parent }
 */
