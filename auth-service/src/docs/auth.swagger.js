/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin login (email + password)
 *     description: |
 *       **Admin only.** Returns a JWT token on successful authentication.
 *
 *       Teachers and Parents use phone OTP login instead:
 *       - Teacher → `POST /api/v1/auth/teacher/send-otp` then `POST /api/v1/auth/teacher/verify-otp`
 *       - Parent  → `POST /api/v1/auth/parent/send-otp`  then `POST /api/v1/auth/parent/verify-otp`
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
 *                 example: "admin@schoolnest.com"
 *               password:
 *                 type: string
 *                 example: "Admin@123"
 *           examples:
 *             Admin (school 101):
 *               summary: Demo school admin
 *               value:
 *                 email: "admin@schoolnest.com"
 *                 password: "Admin@123"
 *             Admin (school 102):
 *               summary: School 102 admin
 *               value:
 *                 email: "admin2@schoolnest.com"
 *                 password: "Admin1@123"
 *             Admin (school 103):
 *               summary: School 103 admin
 *               value:
 *                 email: "admin3@schoolnest.com"
 *                 password: "Admin2@123"
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
 *                       example: "ADM001"
 *                     name:
 *                       type: string
 *                       example: "School Admin"
 *                     role:
 *                       type: string
 *                       example: "ADMIN"
 *                     school_id:
 *                       type: integer
 *                       example: 101
 *       400:
 *         description: Missing email or password
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
 *                 example: "6384582060"
 *                 description: Teacher's registered phone number
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

// ============================================================
// PARENT OTP LOGIN
// ============================================================

/**
 * @swagger
 * /api/v1/auth/parent/send-otp:
 *   post:
 *     tags: [Parent OTP]
 *     summary: Send OTP to parent's phone (from admission records)
 *     description: |
 *       Looks up the parent by the phone number given during their child's
 *       admission (father_phone or mother_phone in parent_guardian_information).
 *       A parent with multiple children will be found across all admissions
 *       but resolved to a single auth user.
 *       In dev mode the OTP is always **1234**.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9500012345"
 *                 description: Phone number given during child's admission (father_phone or mother_phone)
 *     responses:
 *       200:
 *         description: OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:        { type: boolean, example: true }
 *                 message:        { type: string, example: "OTP sent successfully" }
 *                 otp_session_id: { type: string }
 *                 phone_masked:   { type: string, example: "900****0005" }
 *                 expires_in:     { type: integer, example: 300 }
 *                 children_count: { type: integer, example: 2, description: "Number of children enrolled under this parent" }
 *       404:
 *         description: Phone not found in any admission record
 */

/**
 * @swagger
 * /api/v1/auth/parent/verify-otp:
 *   post:
 *     tags: [Parent OTP]
 *     summary: Verify OTP and receive JWT token (role=PARENT)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp_session_id, otp_code]
 *             properties:
 *               otp_session_id: { type: string, description: "Returned by send-otp" }
 *               otp_code:       { type: string, example: "1234", description: "Dev mode: always 1234" }
 *     responses:
 *       200:
 *         description: Verified — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token:   { type: string, example: "eyJhbGciOiJIUzI1NiIs..." }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:             { type: string, example: "PAR201" }
 *                     name:           { type: string, example: "Anil Agarwal" }
 *                     email:          { type: string }
 *                     role:           { type: string, example: "PARENT" }
 *                     school_id:      { type: integer, example: 101 }
 *                     children_count: { type: integer, example: 2 }
 *       401:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/v1/auth/parent/resend-otp:
 *   post:
 *     tags: [Parent OTP]
 *     summary: Resend OTP (reuses active session or creates new one)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone: { type: string, example: "9500012345" }
 *     responses:
 *       200:
 *         description: OTP resent
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
