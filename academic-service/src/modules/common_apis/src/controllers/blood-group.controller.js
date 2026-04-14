const bloodGroupService = require("../services/blood-group.service");
const { sendSuccess, sendError } = require("../utils/response");
const { HTTP_STATUS, ERROR_CODES } = require("../constants");

// Get all blood groups
const getAllBloodGroups = async (req, res) => {
  try {
    const result = await bloodGroupService.getAllBloodGroups();
    sendSuccess(
      res,
      result.data,
      `Found ${result.count} blood groups`,
      HTTP_STATUS.OK
    );
  } catch (error) {
    sendError(
      res,
      error.message,
      HTTP_STATUS.INTERNAL_ERROR,
      ERROR_CODES.DATABASE_ERROR
    );
  }
};
//normal
// Get blood group by ID
const getBloodGroupById = async (req, res) => {
  try {
    const { bloodGroupId } = req.params;

    if (!bloodGroupId) {
      return sendError(
        res,
        "Blood group ID is required",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await bloodGroupService.getBloodGroupById(bloodGroupId);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    sendSuccess(
      res,
      result.data,
      "Blood group retrieved successfully",
      HTTP_STATUS.OK
    );
  } catch (error) {
    sendError(
      res,
      error.message,
      HTTP_STATUS.INTERNAL_ERROR,
      ERROR_CODES.DATABASE_ERROR
    );
  }
};

// Create a new blood group
const createBloodGroup = async (req, res) => {
  try {
    const { blood_group } = req.body;

    if (!blood_group) {
      return sendError(
        res,
        "Blood group is required",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await bloodGroupService.createBloodGroup(blood_group);

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
    sendError(
      res,
      error.message,
      HTTP_STATUS.INTERNAL_ERROR,
      ERROR_CODES.DATABASE_ERROR
    );
  }
};

// Update a blood group
const updateBloodGroup = async (req, res) => {
  try {
    const { bloodGroupId } = req.params;
    const { blood_group } = req.body;

    if (!bloodGroupId) {
      return sendError(
        res,
        "Blood group ID is required",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    if (!blood_group) {
      return sendError(
        res,
        "Blood group is required",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await bloodGroupService.updateBloodGroup(
      bloodGroupId,
      blood_group
    );

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
    sendError(
      res,
      error.message,
      HTTP_STATUS.INTERNAL_ERROR,
      ERROR_CODES.DATABASE_ERROR
    );
  }
};

// Delete a blood group
const deleteBloodGroup = async (req, res) => {
  try {
    const { bloodGroupId } = req.params;

    if (!bloodGroupId) {
      return sendError(
        res,
        "Blood group ID is required",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await bloodGroupService.deleteBloodGroup(bloodGroupId);

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
    sendError(
      res,
      error.message,
      HTTP_STATUS.INTERNAL_ERROR,
      ERROR_CODES.DATABASE_ERROR
    );
  }
};

module.exports = {
  getAllBloodGroups,
  getBloodGroupById,
  createBloodGroup,
  updateBloodGroup,
  deleteBloodGroup,
};
