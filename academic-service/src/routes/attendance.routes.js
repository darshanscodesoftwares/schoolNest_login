const express = require('express');
const attendanceController = require('../controllers/attendance.controller');

const router = express.Router();

router.get('/teacher/classes', attendanceController.getTeacherClasses);
router.get('/classes/:classId/students', attendanceController.getClassStudents);
router.post('/attendance/submit', attendanceController.submitAttendance);

module.exports = router;
