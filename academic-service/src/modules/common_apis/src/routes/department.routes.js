const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');

// Get all departments
router.get('/', departmentController.getAllDepartments);

// Get department by ID
router.get('/:departmentId', departmentController.getDepartmentById);

// Create a new department
router.post('/', departmentController.createDepartment);

// Update a department
router.put('/:departmentId', departmentController.updateDepartment);

// Delete a department
router.delete('/:departmentId', departmentController.deleteDepartment);

module.exports = router;
