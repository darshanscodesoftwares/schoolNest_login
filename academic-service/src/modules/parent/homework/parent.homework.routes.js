const express = require('express');
const homeworkController = require('./parent.homework.controller');

const router = express.Router();

// Get homework for parent's children (tab: today | upcoming)
router.get('/homework', homeworkController.getHomework);

module.exports = router;
