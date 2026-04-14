const enquirySourceService = require('../services/enquiry-source.service');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

// Get all enquiry sources
const getAllEnquirySources = async (req, res) => {
  try {
    const result = await enquirySourceService.getAllEnquirySources();
    sendSuccess(res, result.data, `Found ${result.count} enquiry sources`, HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Get enquiry source by ID
const getEnquirySourceById = async (req, res) => {
  try {
    const { sourceId } = req.params;

    if (!sourceId) {
      return sendError(
        res,
        'Source ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await enquirySourceService.getEnquirySourceById(sourceId);

    if (!result.success) {
      return sendError(
        res,
        result.error,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    sendSuccess(res, result.data, 'Enquiry source retrieved successfully', HTTP_STATUS.OK);
  } catch (error) {
    sendError(res, error.message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
};

// Create a new enquiry source
const createEnquirySource = async (req, res) => {
  try {
    const { source_name } = req.body;

    if (!source_name) {
      return sendError(
        res,
        'Source name is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await enquirySourceService.createEnquirySource(source_name);

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

// Update an enquiry source
const updateEnquirySource = async (req, res) => {
  try {
    const { sourceId } = req.params;
    const { source_name } = req.body;

    if (!sourceId) {
      return sendError(
        res,
        'Source ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    if (!source_name) {
      return sendError(
        res,
        'Source name is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await enquirySourceService.updateEnquirySource(sourceId, source_name);

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

// Delete an enquiry source
const deleteEnquirySource = async (req, res) => {
  try {
    const { sourceId } = req.params;

    if (!sourceId) {
      return sendError(
        res,
        'Source ID is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const result = await enquirySourceService.deleteEnquirySource(sourceId);

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
  getAllEnquirySources,
  getEnquirySourceById,
  createEnquirySource,
  updateEnquirySource,
  deleteEnquirySource
};
