const express = require('express');
const leaveController = require('./teacher.leave.controller');

const router = express.Router();

// List leave requests by tab (pending | approved | rejected)
router.get('/leave-requests', leaveController.getLeaveRequests);

// Approve or reject a leave request
router.patch('/leave-requests/:leaveId', leaveController.updateLeaveStatus);

module.exports = router;
