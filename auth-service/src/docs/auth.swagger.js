/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     description: Returns a JWT token on successful authentication. Works for Admin, Teacher, and Parent roles.
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
 *                 example: "john@schoolnest.com"
 *               password:
 *                 type: string
 *                 example: "Teacher@123"
 *           examples:
 *             Teacher:
 *               summary: Teacher login
 *               value:
 *                 email: "john@schoolnest.com"
 *                 password: "Teacher@123"
 *             Parent:
 *               summary: Parent login
 *               value:
 *                 email: "alice@schoolnest.com"
 *                 password: "Parent@123"
 *             Admin:
 *               summary: Admin login
 *               value:
 *                 email: "admin@schoolnest.com"
 *                 password: "Admin@123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: "TCH001"
 *                     name:
 *                       type: string
 *                       example: "John Smith"
 *                     role:
 *                       type: string
 *                       example: "TEACHER"
 *                     school_id:
 *                       type: integer
 *                       example: 101
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email and password are required"
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *                 code:
 *                   type: string
 *                   example: "AUTH_FAILED"
 */

// ============================================================
// TEACHER OTP LOGIN
// ============================================================

/**
 * @swagger
 * /api/v1/auth/teacher/send-otp:
 *   post:
 *     tags: [Teacher OTP]
 *     summary: Send OTP to teacher's registered phone number
 *     description: |
 *       Looks up the teacher by phone across all schools.
 *       In dev mode the OTP is always **1234** (logged to console).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [primary_phone]
 *             properties:
 *               primary_phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent — returns otp_session_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 otp_session_id:
 *                   type: string
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 expires_in:
 *                   type: integer
 *                   example: 300
 *                   description: Seconds until OTP expires
 *       404:
 *         description: No teacher found with that phone number
 */

/**
 * @swagger
 * /api/v1/auth/teacher/verify-otp:
 *   post:
 *     tags: [Teacher OTP]
 *     summary: Verify OTP and receive JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp_session_id, otp_code]
 *             properties:
 *               otp_session_id:
 *                 type: string
 *                 description: Returned by send-otp
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               otp_code:
 *                 type: string
 *                 description: "Dev mode: always 1234"
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Verified — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: TEACHER
 *                     school_id:
 *                       type: integer
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/v1/auth/teacher/resend-otp:
 *   post:
 *     tags: [Teacher OTP]
 *     summary: Resend OTP (reuses active session or creates new one)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [primary_phone]
 *             properties:
 *               primary_phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP resent — returns otp_session_id
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate current JWT token
 *     description: Adds the current token to the blacklist so it can no longer be used.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Missing or invalid token
 */
