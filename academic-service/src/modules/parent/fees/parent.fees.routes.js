const express = require('express');
const feesController = require('./parent.fees.controller');

const router = express.Router();

// GET /api/v1/parent/students/:studentId/fees — summary + fee details
router.get('/students/:studentId/fees', feesController.getFeesSummary);

// GET /api/v1/parent/students/:studentId/fees/history — payment history
router.get('/students/:studentId/fees/history', feesController.getPaymentHistory);

module.exports = router;
