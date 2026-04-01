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
