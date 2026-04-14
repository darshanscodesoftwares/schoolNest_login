const express = require('express');
const router = express.Router();
const staffRolesController = require('./staff-roles.controller');

// GET all staff roles
router.get('/staff-roles', staffRolesController.getAllStaffRoles);

// GET staff role by ID
router.get('/staff-roles/:staffRoleId', staffRolesController.getStaffRoleById);

// POST create new staff role
router.post('/staff-roles', staffRolesController.createStaffRole);

// PUT update staff role
router.put('/staff-roles/:staffRoleId', staffRolesController.updateStaffRole);

// DELETE staff role
router.delete('/staff-roles/:staffRoleId', staffRolesController.deleteStaffRole);

module.exports = router;
