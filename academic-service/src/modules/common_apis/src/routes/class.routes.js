const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');

// Get all classes
router.get('/', classController.getAllClasses);

// Get class by ID
router.get('/:classId', classController.getClassById);

// Create a new class
router.post('/', classController.createClass);

// Update a class
router.put('/:classId', classController.updateClass);

// Delete a class
router.delete('/:classId', classController.deleteClass);

module.exports = router;
