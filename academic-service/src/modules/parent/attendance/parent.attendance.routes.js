const express = require('express');
const parentController = require('./parent.attendance.controller');

const router = express.Router();

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
