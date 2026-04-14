const staffDepartmentsService = require('./staff-departments.service');

// GET all staff departments
const getAllStaffDepartments = async (req, res, next) => {
  try {
    const result = await staffDepartmentsService.getAllStaffDepartments();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET staff department by ID
const getStaffDepartmentById = async (req, res, next) => {
  try {
    const { staffDepartmentId } = req.params;

    if (!staffDepartmentId) {
      const error = new Error('Staff department ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffDepartmentsService.getStaffDepartmentById(staffDepartmentId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// POST create staff department
const createStaffDepartment = async (req, res, next) => {
  try {
    const staffDepartmentData = req.body;

    const result = await staffDepartmentsService.createStaffDepartment(staffDepartmentData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update staff department
const updateStaffDepartment = async (req, res, next) => {
  try {
    const { staffDepartmentId } = req.params;
    const updateData = req.body;

    if (!staffDepartmentId) {
      const error = new Error('Staff department ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffDepartmentsService.updateStaffDepartment(staffDepartmentId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE staff department
const deleteStaffDepartment = async (req, res, next) => {
  try {
    const { staffDepartmentId } = req.params;

    if (!staffDepartmentId) {
      const error = new Error('Staff department ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffDepartmentsService.deleteStaffDepartment(staffDepartmentId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllStaffDepartments,
  getStaffDepartmentById,
  createStaffDepartment,
  updateStaffDepartment,
  deleteStaffDepartment
};
