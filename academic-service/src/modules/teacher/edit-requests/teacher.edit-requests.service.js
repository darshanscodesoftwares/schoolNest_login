const editRequestsRepository = require('./teacher.edit-requests.repository');

/**
 * Create new edit request
 * Flow:
 * 1. Check if teacher already has a pending request
 * 2. Create edit request with PENDING status
 */
const createEditRequest = async ({ school_id, teacher_id, changed_fields, reason }) => {
  try {
    // Check if teacher already has a pending request
    // TODO: Uncomment this validation after testing
    // const pendingCount = await editRequestsRepository.countPendingRequests({ school_id, teacher_id });
    //
    // if (pendingCount > 0) {
    //   const error = new Error('You already have a pending edit request. Please wait for admin approval or cancel the existing request.');
    //   error.statusCode = 400;
    //   error.code = 'PENDING_REQUEST_EXISTS';
    //   throw error;
    // }

    // Create edit request
    const result = await editRequestsRepository.createEditRequest({
      school_id,
      teacher_id,
      changed_fields,
      reason
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'CREATE_EDIT_REQUEST_ERROR'
    };
  }
};

/**
 * Get teacher's own edit requests
 */
const getTeacherEditRequests = async ({ school_id, teacher_id }) => {
  try {
    const requests = await editRequestsRepository.getTeacherEditRequests({
      school_id,
      teacher_id
    });

    return requests;
  } catch (error) {
    throw {
      message: error.message,
      statusCode: 500,
      code: 'GET_EDIT_REQUESTS_ERROR'
    };
  }
};

/**
 * Get single edit request by ID
 */
const getEditRequestById = async ({ school_id, teacher_id, request_id }) => {
  try {
    const request = await editRequestsRepository.getEditRequestById({
      school_id,
      teacher_id,
      request_id
    });

    if (!request) {
      const error = new Error('Edit request not found');
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    return request;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'GET_EDIT_REQUEST_ERROR'
    };
  }
};

/**
 * Cancel pending edit request
 */
const cancelEditRequest = async ({ school_id, teacher_id, request_id }) => {
  try {
    const result = await editRequestsRepository.cancelEditRequest({
      school_id,
      teacher_id,
      request_id
    });

    if (!result) {
      const error = new Error('Edit request not found or already processed');
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'CANCEL_EDIT_REQUEST_ERROR'
    };
  }
};

module.exports = {
  createEditRequest,
  getTeacherEditRequests,
  getEditRequestById,
  cancelEditRequest
};
