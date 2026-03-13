const express = require('express');
const resultsController = require('./parent.results.controller');

const router = express.Router();

// List all exams for child's class (dropdown)
router.get('/results/exams', resultsController.getExamsList);

// Get result detail for selected exam
router.get('/results/:examId', resultsController.getResultDetail);

module.exports = router;
