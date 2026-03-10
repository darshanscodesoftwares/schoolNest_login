const express = require('express');
const timetableController = require('./teacher.timetable.controller');

const router = express.Router();

// Get teacher's timetable for a day (?day=Monday) — defaults to today
router.get('/timetable', timetableController.getTimetableByDay);

// Get next upcoming class based on current time
router.get('/timetable/next-class', timetableController.getNextClass);

// Class detail screen header — student count + class info
router.get('/classes/:classId/summary', timetableController.getClassSummary);

// Class detail screen — last attendance + last homework
router.get('/classes/:classId/recent-activity', timetableController.getRecentActivity);

module.exports = router;
