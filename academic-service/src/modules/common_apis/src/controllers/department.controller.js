const departmentService = require('../services/department.service');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const result = await departmentService.getAllDepartments();
    sendSuccess(res, result.data, `Found ${result.count} departments`, HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return sendError(
        res,
        'Department ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await departmentService.getDepartmentById(departmentId);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    sendSuccess(res, result.data, 'Department retrieved successfully', HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { department_name } = req.body;

    if (!department_name) {
      return sendError(
        res,
        'Department name is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await departmentService.createDepartment(department_name);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    sendSuccess(res, result.data, result.message, HTTP_STATUS.CREATED);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { department_name } = req.body;

    if (!departmentId) {
      return sendError(
        res,
        'Department ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    if (!department_name) {
      return sendError(
        res,
        'Department name is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await departmentService.updateDepartment(departmentId, department_name);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    sendSuccess(res, result.data, result.message, HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return sendError(
        res,
        'Department ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await departmentService.deleteDepartment(departmentId);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    sendSuccess(res, result.data, result.message, HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
