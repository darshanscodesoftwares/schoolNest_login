const express = require('express');
const attendanceController = require('./teacher.attendance.controller');

const router = express.Router();

// Existing endpoints
router.get('/teacher/classes', attendanceController.getTeacherClasses);
router.get('/classes/:classId/students', attendanceController.getClassStudents);
router.get('/attendance-statuses', attendanceController.getAttendanceStatuses);
router.post('/attendance/submit', attendanceController.submitAttendance);

// New endpoints: History, Reports & Editing
router.get('/classes/:classId/attendance', attendanceController.getAttendanceHistory);
router.get('/students/:studentId/attendance-summary', attendanceController.getStudentSummary);
router.get('/classes/:classId/attendance-report', attendanceController.getClassReport);
router.patch('/attendance/:recordId', attendanceController.updateAttendance);
router.delete('/attendance/:recordId', attendanceController.deleteAttendance);

module.exports = router;
