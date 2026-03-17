const express = require('express');
const timetableController = require('./teacher.timetable.controller');

const router = express.Router();

// My Timetable screen — periods for a day + next class (?day=Monday, defaults to today)
router.get('/timetable', timetableController.getTimetable);

// Class detail screen — header info + recent activity
router.get('/classes/:classId/detail', timetableController.getClassDetail);

module.exports = router;
