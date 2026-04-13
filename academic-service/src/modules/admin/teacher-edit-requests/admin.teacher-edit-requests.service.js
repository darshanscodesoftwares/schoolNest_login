const adminRepository = require('./admin.teacher-edit-requests.repository');

/**
 * Validate admin role
 */
const assertAdminRole = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const error = new Error('Forbidden: only administrators can access this resource');
    error.statusCode = 403;
    error.code = 'INSUFFICIENT_PERMISSIONS';
    throw error;
  }
};

/**
 * Get all edit requests
 */
const getAllEditRequests = async ({ user, school_id, teacher_id, status, from_date, to_date, limit, offset }) => {
  try {
    assertAdminRole(user);

    const requests = await adminRepository.getAllEditRequests({
      school_id,
      teacher_id,
      status,
      from_date,
      to_date,
      limit,
      offset
    });

    return requests;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'GET_EDIT_REQUESTS_ERROR'
    };
  }
};

/**
 * Get single edit request
 */
const getEditRequestById = async ({ user, school_id, request_id }) => {
  try {
    assertAdminRole(user);

    const request = await adminRepository.getEditRequestById({
      school_id,
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
 * Approve edit request
 */
const approveEditRequest = async ({ user, school_id, request_id }) => {
  try {
    assertAdminRole(user);

    // Get edit request first
    const editRequest = await adminRepository.getEditRequestById({
      school_id,
      request_id
    });

    if (!editRequest) {
      const error = new Error('Edit request not found');
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    // Approve request (delete the record)
    const result = await adminRepository.approveEditRequest({
      school_id,
      request_id
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'APPROVE_REQUEST_ERROR'
    };
  }
};

/**
 * Reject edit request
 */
const rejectEditRequest = async ({ user, school_id, request_id }) => {
  try {
    assertAdminRole(user);

    // Get edit request first
    const editRequest = await adminRepository.getEditRequestById({
      school_id,
      request_id
    });

    if (!editRequest) {
      const error = new Error('Edit request not found');
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    // Reject request (delete the record)
    const result = await adminRepository.rejectEditRequest({
      school_id,
      request_id
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'REJECT_REQUEST_ERROR'
    };
  }
};

/**
 * Get edit request statistics
 */
const getEditRequestStats = async ({ user, school_id }) => {
  try {
    assertAdminRole(user);

    const stats = await adminRepository.getEditRequestStats({
      school_id
    });

    return stats;
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'GET_STATS_ERROR'
    };
  }
};

module.exports = {
  getAllEditRequests,
  getEditRequestById,
  approveEditRequest,
  rejectEditRequest,
  getEditRequestStats
};
