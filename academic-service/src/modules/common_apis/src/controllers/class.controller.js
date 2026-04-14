const classService = require('../services/class.service');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const result = await classService.getAllClasses();
    sendSuccess(res, result.data, `Found ${result.count} classes`, HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return sendError(
        res,
        'Class ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await classService.getClassById(classId);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    sendSuccess(res, result.data, 'Class retrieved successfully', HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Create a new class
const createClass = async (req, res) => {
  try {
    const { class_name } = req.body;

    if (!class_name) {
      return sendError(
        res,
        'Class name is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await classService.createClass(class_name);

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

// Update a class
const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { class_name } = req.body;

    if (!classId) {
      return sendError(
        res,
        'Class ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    if (!class_name) {
      return sendError(
        res,
        'Class name is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await classService.updateClass(classId, class_name);

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

// Delete a class
const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return sendError(
        res,
        'Class ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await classService.deleteClass(classId);

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
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
