const express = require('express');
const checkinController = require('./teacher.checkin.controller');

const router = express.Router();

router.get('/teacher/checkin/status', checkinController.getTodayCheckinStatus);
router.post('/teacher/checkin', checkinController.markCheckin);

module.exports = router;
