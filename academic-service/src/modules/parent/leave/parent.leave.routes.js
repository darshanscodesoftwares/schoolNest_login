const express = require('express');
const leaveController = require('./parent.leave.controller');

const router = express.Router();

// Apply leave for child
router.post('/leave', leaveController.applyLeave);

// View leave history
router.get('/leave/history', leaveController.getLeaveHistory);

module.exports = router;
