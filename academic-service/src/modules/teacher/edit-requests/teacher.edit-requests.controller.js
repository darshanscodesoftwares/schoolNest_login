const editRequestsService = require('./teacher.edit-requests.service');

/**
 * Map database status to display status
 */
const mapStatusDisplay = (dbStatus) => {
  const statusMap = {
    'PENDING': 'PENDING APPROVAL',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED'
  };
  return statusMap[dbStatus] || dbStatus;
};

/**
 * Parse changed_fields - ensure it's an object not a string
 */
const parseChangedFields = (changedFields) => {
  if (!changedFields) return null;
  if (typeof changedFields === 'string') {
    try {
      return JSON.parse(changedFields);
    } catch (e) {
      return changedFields;
    }
  }
  return changedFields;
};

/**
 * POST /api/v1/academic/teacher/edit-requests
 * Create new edit request with changed fields
 * Request body: { school_id, changed_fields: { field_name: new_value } }
 */
const createEditRequest = async (req, res, next) => {
  try {
    const { user_id: teacher_id, school_id: userSchoolId } = req.user;
    const { school_id, changed_fields, reason } = req.body;

    // Validate input
    if (!school_id) {
      const error = new Error('school_id is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'school_id', message: 'school_id is required' }];
      throw error;
    }

    if (!changed_fields || Object.keys(changed_fields).length === 0) {
      const error = new Error('changed_fields is required and must not be empty');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'changed_fields', message: 'Please provide at least one field to update' }];
      throw error;
    }

    // Validate school_id matches teacher's assigned school
    if (school_id !== userSchoolId) {
      const error = new Error('School ID mismatch. You can only create edit requests for your assigned school.');
      error.statusCode = 403;
      error.code = 'SCHOOL_ID_MISMATCH';
      throw error;
    }

    // Call service layer
    const result = await editRequestsService.createEditRequest({
      school_id,
      teacher_id,
      changed_fields,
      reason: reason || null
    });

    return res.status(201).json({
      success: true,
      message: 'Edit request submitted successfully. Status: Pending Approval.',
      data: {
        id: result.id,
        school_id: result.school_id,
        teacher_id: result.teacher_id,
        changed_fields: parseChangedFields(result.changed_fields),
        reason: result.reason,
        status: mapStatusDisplay(result.status),
        created_at: result.created_at
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/academic/teacher/edit-requests
 * Get own edit requests
 */
const getMyEditRequests = async (req, res, next) => {
  try {
    const { user_id: teacher_id, school_id } = req.user;

    // Call service layer
    const requests = await editRequestsService.getTeacherEditRequests({
      school_id,
      teacher_id
    });

    return res.status(200).json({
      success: true,
      message: 'Edit requests retrieved successfully',
      data: requests.map(req => ({
        id: req.id,
        teacher_id: req.teacher_id,
        changed_fields: parseChangedFields(req.changed_fields),
        status: mapStatusDisplay(req.status),
        created_at: req.created_at
      })),
      count: requests.length
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/academic/teacher/edit-requests/:requestId
 * Get specific edit request
 */
const getEditRequestById = async (req, res, next) => {
  try {
    const { user_id: teacher_id, school_id } = req.user;
    const { requestId } = req.params;

    // Validate input
    if (!requestId) {
      const error = new Error('Request ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Call service layer - school_id filtering happens in repository
    const request = await editRequestsService.getEditRequestById({
      school_id,
      teacher_id,
      request_id: requestId
    });

    // Additional validation: ensure request belongs to this teacher's school
    if (!request || request.school_id !== school_id) {
      const error = new Error('Edit request not found or does not belong to your school');
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Edit request retrieved successfully',
      data: {
        id: request.id,
        school_id: request.school_id,
        teacher_id: request.teacher_id,
        changed_fields: parseChangedFields(request.changed_fields),
        status: mapStatusDisplay(request.status),
        created_at: request.created_at
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/academic/teacher/edit-requests/:requestId
 * Cancel pending edit request
 */
const cancelEditRequest = async (req, res, next) => {
  try {
    const { user_id: teacher_id, school_id } = req.user;
    const { requestId } = req.params;

    // Validate input
    if (!requestId) {
      const error = new Error('Request ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Call service layer - school_id filtering happens in repository
    const result = await editRequestsService.cancelEditRequest({
      school_id,
      teacher_id,
      request_id: requestId
    });

    // Validate that request was found and belonged to this school
    if (!result) {
      const error = new Error('Edit request not found or does not belong to your school');
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Edit request cancelled successfully',
      data: {
        id: result.id,
        school_id: result.school_id,
        teacher_id,
        cancelled_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createEditRequest,
  getMyEditRequests,
  getEditRequestById,
  cancelEditRequest
};
