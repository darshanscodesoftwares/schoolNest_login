const express = require('express');
const staffStudentsController = require('./staff-students.controller');
const { validateAdminRole } = require('../../../middleware/auth.middleware');

const router = express.Router();

// ============================================================
// APPROVED STUDENTS ENDPOINTS FOR STAFF
// ============================================================

// Get all approved students (with optional filters)
// Query params: ?classId=xxx&section=A&rollNumber=1
router.get('/admin/staff-students', validateAdminRole, staffStudentsController.getAllApprovedStudents);

// Get approved students by class and section
// Example: /admin/staff-students/class/abc123/section/A
router.get('/admin/staff-students/class/:classId/section/:section', validateAdminRole, staffStudentsController.getApprovedStudentsByClassAndSection);

// Get specific approved student by roll number
// Example: /admin/staff-students/class/abc123/roll/1
router.get('/admin/staff-students/class/:classId/roll/:rollNumber', validateAdminRole, staffStudentsController.getApprovedStudentByRollNumber);

// Update approved student by student ID
// Example: /admin/staff-students/abc123
router.put('/admin/staff-students/:studentId', validateAdminRole, staffStudentsController.updateApprovedStudent);

module.exports = router;
