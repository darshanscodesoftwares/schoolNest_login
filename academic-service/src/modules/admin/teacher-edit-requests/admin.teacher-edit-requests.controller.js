const adminService = require('./admin.teacher-edit-requests.service');

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
 * GET /api/v1/academic/admin/teacher-edit-requests
 * Get all edit requests (with filters)
 * Query params: teacher_id, status, from_date, to_date, limit, offset
 */
const getAllEditRequests = async (req, res, next) => {
  try {
    const { school_id } = req.user;
    const { teacher_id, status, from_date, to_date, limit, offset } = req.query;

    // Call service layer
    const requests = await adminService.getAllEditRequests({
      user: req.user,
      school_id,
      teacher_id,
      status,
      from_date,
      to_date,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined
    });

    return res.status(200).json({
      success: true,
      message: 'Edit requests retrieved successfully',
      admin_message: 'Teachers request for profile update',
      data: requests.map(req => ({
        id: req.id,
        school_id: req.school_id,
        teacher_id: req.teacher_id,
        teacher_details: {
          name: req.first_name,
          employee_id: req.employee_id,
          designation: req.designation
        },
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
 * GET /api/v1/academic/admin/teacher-edit-requests/:requestId
 * Get specific edit request
 */
const getEditRequestById = async (req, res, next) => {
  try {
    const { school_id } = req.user;
    const { requestId } = req.params;

    // Validate input
    if (!requestId) {
      const error = new Error('Request ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Call service layer
    const request = await adminService.getEditRequestById({
      user: req.user,
      school_id,
      request_id: requestId
    });

    return res.status(200).json({
      success: true,
      message: 'Edit request retrieved successfully',
      data: {
        id: request.id,
        school_id: request.school_id,
        teacher_id: request.teacher_id,
        teacher_details: {
          name: request.first_name,
          employee_id: request.employee_id,
          designation: request.designation
        },
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
 * PATCH /api/v1/academic/admin/teacher-edit-requests/:requestId/approve
 * Approve edit request
 */
const approveEditRequest = async (req, res, next) => {
  try {
    const { school_id } = req.user;
    const { requestId } = req.params;
    const { admin_notes } = req.body;

    // Validate input
    if (!requestId) {
      const error = new Error('Request ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Call service layer
    const result = await adminService.approveEditRequest({
      user: req.user,
      school_id,
      request_id: requestId,
      admin_notes
    });

    return res.status(200).json({
      success: true,
      message: 'Edit request approved successfully. Teacher profile updated.',
      data: {
        id: result.id,
        school_id: result.school_id,
        teacher_id: result.teacher_id,
        teacher_details: {
          name: result.first_name,
          employee_id: result.employee_id,
          designation: result.designation
        },
        changed_fields: parseChangedFields(result.changed_fields),
        status: mapStatusDisplay(result.status),
        admin_notes: result.admin_notes,
        approved_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/academic/admin/teacher-edit-requests/:requestId/reject
 * Reject edit request
 */
const rejectEditRequest = async (req, res, next) => {
  try {
    const { school_id } = req.user;
    const { requestId } = req.params;
    const { rejection_reason } = req.body;

    // Validate input
    if (!requestId) {
      const error = new Error('Request ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    if (!rejection_reason) {
      const error = new Error('Rejection reason is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Call service layer
    const result = await adminService.rejectEditRequest({
      user: req.user,
      school_id,
      request_id: requestId,
      rejection_reason
    });

    return res.status(200).json({
      success: true,
      message: 'Edit request rejected successfully',
      data: {
        id: result.id,
        school_id: result.school_id,
        teacher_id: result.teacher_id,
        rejection_reason: result.rejection_reason,
        rejected_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/academic/admin/teacher-edit-requests/stats
 * Get edit request statistics
 */
const getEditRequestStats = async (req, res, next) => {
  try {
    const { school_id } = req.user;

    // Call service layer
    const stats = await adminService.getEditRequestStats({
      user: req.user,
      school_id
    });

    return res.status(200).json({
      success: true,
      message: 'Edit request statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllEditRequests,
  getEditRequestById,
  approveEditRequest,
  rejectEditRequest,
  getEditRequestStats
};
