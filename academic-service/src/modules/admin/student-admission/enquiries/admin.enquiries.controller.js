const enquiriesService = require('./admin.enquiries.service');

/**
 * Assert user is ADMIN role
 */
const assertAdminRole = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const error = new Error('Forbidden: only administrators can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

/**
 * Extract auth token from request for common-api calls
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader; // Return full "Bearer token" string
};

/**
 * GET /api/v1/academic/admin/enquiries
 * Get all enquiries with optional filters
 */
const getAllEnquiries = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      class_id: req.query.class_id,
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await enquiriesService.getAllEnquiries(req.user, filters);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/academic/admin/enquiries/:enquiryId
 * Get single enquiry by ID
 */
const getEnquiryById = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;

    const result = await enquiriesService.getEnquiryById(req.user, enquiryId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/academic/admin/enquiries
 * Create new enquiry
 */
const createEnquiry = async (req, res, next) => {
  try {
    const authToken = extractToken(req);

    if (!authToken) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      error.code = 'MISSING_TOKEN';
      return next(error);
    }

    // Extract all fields except enquiry_status (auto-set to 'New')
    const { enquiry_status, ...enquiryData } = req.body;

    const result = await enquiriesService.createEnquiry(req.user, enquiryData, authToken);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/v1/academic/admin/enquiries/:enquiryId
 * Update enquiry (full update)
 */
const updateEnquiry = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const authToken = extractToken(req);

    if (!authToken) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      error.code = 'MISSING_TOKEN';
      return next(error);
    }

    const updateData = req.body;

    const result = await enquiriesService.updateEnquiry(req.user, enquiryId, updateData, authToken);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/academic/admin/enquiries/:enquiryId/status
 * Update enquiry status only
 */
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const { status } = req.body;

    if (!status) {
      const error = new Error('Status is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const result = await enquiriesService.updateEnquiryStatus(req.user, enquiryId, status);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/academic/admin/enquiries/:enquiryId
 * Delete enquiry
 */
const deleteEnquiry = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;

    const result = await enquiriesService.deleteEnquiry(req.user, enquiryId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/academic/admin/enquiries/stats/summary
 * Get enquiry statistics by status
 */
const getEnquiryStats = async (req, res, next) => {
  try {
    const result = await enquiriesService.getEnquiryStats(req.user);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/academic/admin/enquiries/jobs/trigger-auto-transition
 * Manually trigger auto-transition job (for testing)
 * Converts all "New" enquiries older than 24 hours to "Follow-up" status
 */
const triggerAutoTransition = async (req, res, next) => {
  try {
    assertAdminRole(req.user);

    const result = await enquiriesService.autoTransitionNewEnquiries();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryStats,
  triggerAutoTransition
};
