const express = require('express');
const router = express.Router();
const staffPositionsController = require('./staff-positions.controller');

// GET all staff positions
router.get('/staff-positions', staffPositionsController.getAllStaffPositions);

// GET staff position by ID
router.get('/staff-positions/:staffPositionId', staffPositionsController.getStaffPositionById);

// POST create new staff position
router.post('/staff-positions', staffPositionsController.createStaffPosition);

// PUT update staff position
router.put('/staff-positions/:staffPositionId', staffPositionsController.updateStaffPosition);

// DELETE staff position
router.delete('/staff-positions/:staffPositionId', staffPositionsController.deleteStaffPosition);

module.exports = router;
