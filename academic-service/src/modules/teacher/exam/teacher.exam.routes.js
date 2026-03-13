const express = require('express');
const examController = require('./teacher.exam.controller');

const router = express.Router();

// List exams by tab (upcoming | ongoing | completed)
router.get('/exams', examController.getExams);

// Get students list for marks entry
router.get('/exams/:examSubjectId/marks', examController.getMarksEntry);

// Save draft or submit marks
router.post('/exams/:examSubjectId/marks', examController.saveMarks);

module.exports = router;
