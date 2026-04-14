const express = require('express');
const bloodGroupController = require('../controllers/blood-group.controller');

const router = express.Router();

// Get all blood groups
router.get('/', bloodGroupController.getAllBloodGroups);

// Get blood group by ID
router.get('/:bloodGroupId', bloodGroupController.getBloodGroupById);

// Create a new blood group
router.post('/', bloodGroupController.createBloodGroup);

// Update a blood group
router.put('/:bloodGroupId', bloodGroupController.updateBloodGroup);

// Delete a blood group
router.delete('/:bloodGroupId', bloodGroupController.deleteBloodGroup);

module.exports = router;
