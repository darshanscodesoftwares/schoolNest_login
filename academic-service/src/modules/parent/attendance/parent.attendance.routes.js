const express = require('express');
const parentController = require('./parent.attendance.controller');

const router = express.Router();

// Get parent profile + all children info (for parent app login page)
router.get('/profile', parentController.getParentProfile);

router.get('/students', parentController.getParentStudents);

router.get(
  '/students/:studentId/attendance/summary',
  parentController.getAttendanceSummary
);

router.get(
  '/students/:studentId/attendance/month',
  parentController.getMonthlyAttendance
);

router.get(
  '/students/:studentId/attendance/recent',
  parentController.getRecentAttendance
);

module.exports = router;
