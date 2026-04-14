const express = require('express');
const router = express.Router();
const staffDepartmentsController = require('./staff-departments.controller');

// GET all staff departments
router.get('/staff-departments', staffDepartmentsController.getAllStaffDepartments);

// GET staff department by ID
router.get('/staff-departments/:staffDepartmentId', staffDepartmentsController.getStaffDepartmentById);

// POST create new staff department
router.post('/staff-departments', staffDepartmentsController.createStaffDepartment);

// PUT update staff department
router.put('/staff-departments/:staffDepartmentId', staffDepartmentsController.updateStaffDepartment);

// DELETE staff department
router.delete('/staff-departments/:staffDepartmentId', staffDepartmentsController.deleteStaffDepartment);

module.exports = router;
