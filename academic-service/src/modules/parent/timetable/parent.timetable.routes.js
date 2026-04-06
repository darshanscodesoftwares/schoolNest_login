const express = require('express');
const timetableController = require('./parent.timetable.controller');

const router = express.Router();

router.get(
  '/students/:studentId/timetable',
  timetableController.getStudentTimetable
);

module.exports = router;
