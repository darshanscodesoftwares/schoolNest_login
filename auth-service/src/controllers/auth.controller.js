const { generateToken } = require('../utils/jwt');

// In-memory user database (dummy data)
const users = {
  ADMIN: [
    { id: 'ADM001', name: 'Admin User', email: 'admin@schoolnest.com', password: 'admin123' },
    { id: 'ADM002', name: 'Kaamesh', email: 'kaamesh@schoolnest.com', password: 'admin123' }
  ],
  TEACHER: [
    { id: 'TCH001', name: 'John Doe', email: 'john@schoolnest.com', password: 'Teacher@123' },
    { id: 'TCH002', name: 'Jane Smith', email: 'jane@schoolnest.com', password: 'Teacher@123' },
  ],
  PARENT: [
    { id: 'PAR001', name: 'Alice Johnson', email: 'alice@schoolnest.com', password: 'Parent@123' },
    { id: 'PAR002', name: 'Bob Wilson', email: 'bob@schoolnest.com', password: 'Parent@123' },
  ],
};

/**
 * Generic login handler
 */
const loginHandler = (role) => {
  return (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user
    const user = users[role]?.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      role,
      schoolId: 'SCH1',
    });

    // Return response
    return res.status(200).json({
      token,
      role,
      user: {
        id: user.id,
        name: user.name,
      },
    });
  };
};

/**
 * Admin login
 */
const adminLogin = loginHandler('ADMIN');

/**
 * Teacher login
 */
const teacherLogin = loginHandler('TEACHER');

/**
 * Parent login
 */
const parentLogin = loginHandler('PARENT');

module.exports = {
  adminLogin,
  teacherLogin,
  parentLogin,
};
