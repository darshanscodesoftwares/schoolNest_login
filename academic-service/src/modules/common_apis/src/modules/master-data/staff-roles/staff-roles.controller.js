const staffRolesService = require('./staff-roles.service');

// GET all staff roles
const getAllStaffRoles = async (req, res, next) => {
  try {
    const result = await staffRolesService.getAllStaffRoles();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET staff role by ID
const getStaffRoleById = async (req, res, next) => {
  try {
    const { staffRoleId } = req.params;

    if (!staffRoleId) {
      const error = new Error('Staff role ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffRolesService.getStaffRoleById(staffRoleId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// POST create staff role
const createStaffRole = async (req, res, next) => {
  try {
    const staffRoleData = req.body;

    const result = await staffRolesService.createStaffRole(staffRoleData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update staff role
const updateStaffRole = async (req, res, next) => {
  try {
    const { staffRoleId } = req.params;
    const updateData = req.body;

    if (!staffRoleId) {
      const error = new Error('Staff role ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffRolesService.updateStaffRole(staffRoleId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE staff role
const deleteStaffRole = async (req, res, next) => {
  try {
    const { staffRoleId } = req.params;

    if (!staffRoleId) {
      const error = new Error('Staff role ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffRolesService.deleteStaffRole(staffRoleId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllStaffRoles,
  getStaffRoleById,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole
};
