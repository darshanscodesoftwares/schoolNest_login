const express = require('express');
const feesController = require('./parent.fees.controller');

const router = express.Router();

// GET /api/v1/parent/students/:studentId/fees — summary + fee details
router.get('/students/:studentId/fees', feesController.getFeesSummary);

// GET /api/v1/parent/students/:studentId/fees/history — payment history
router.get('/students/:studentId/fees/history', feesController.getPaymentHistory);

// POST /api/v1/parent/students/:studentId/fees/:feeId/pay — dummy UPI payment
// (dev only — no gateway). Flips status to PAID and records a payment row.
router.post('/students/:studentId/fees/:feeId/pay', feesController.dummyPayFee);

module.exports = router;
