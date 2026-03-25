const express = require('express');
const resultsController = require('./parent.results.controller');

const router = express.Router();

// List all exams for selected student's class (dropdown)
router.get('/students/:studentId/results/exams', resultsController.getExamsList);

// Get result detail for selected exam and student
router.get('/students/:studentId/results/:examId', resultsController.getResultDetail);

module.exports = router;
