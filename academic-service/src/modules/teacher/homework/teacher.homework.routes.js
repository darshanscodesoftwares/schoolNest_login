const express = require('express');
const homeworkController = require('./teacher.homework.controller');

const router = express.Router();

// List all homework (tab: today | upcoming | completed)
router.get('/homework', homeworkController.getHomework);

// Create homework
router.post('/homework', homeworkController.createHomework);

// Get homework for a specific class (timetable class detail screen)
router.get('/classes/:classId/homework', homeworkController.getHomeworkByClass);

module.exports = router;
