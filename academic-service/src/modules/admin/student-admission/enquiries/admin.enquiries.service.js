const enquiriesRepository = require('./admin.enquiries.repository');
const { validateClassExists, validateEnquirySourceExists } = require('../../../../utils/common-api.client');

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
 * Validate enquiry status
 */
const VALID_STATUSES = ['New', 'Contacted', 'Visited', 'Converted', 'Rejected', 'Follow-up'];
const VALID_FILTER_STATUSES = ['All', ...VALID_STATUSES]; // Allow 'All' for filtering

const validateEnquiryStatus = (status) => {
  if (status && !VALID_STATUSES.includes(status)) {
    const error = new Error(`Invalid enquiry status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }
};

const validateFilterStatus = (status) => {
  if (status && !VALID_FILTER_STATUSES.includes(status)) {
    const error = new Error(`Invalid status filter. Must be one of: ${VALID_FILTER_STATUSES.join(', ')}`);
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_FILTER';
    throw error;
  }
};

/**
 * Validate required fields for enquiry creation
 */
const validateRequiredFields = (data) => {
  const required = [
    'student_name',
    'father_name',
    'contact_number',
    'class_id',
    'academic_year',
    'preferred_medium',
    'source_id'
  ];

  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = { missing_fields: missing };
    throw error;
  }
};

/**
 * Validate email format (if provided)
 */
const validateEmail = (email) => {
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      error.code = 'INVALID_EMAIL';
      throw error;
    }
  }
};

/**
 * Validate contact number format
 */
const validateContactNumber = (contactNumber) => {
  const phoneRegex = /^\+?[\d\s-()]{10,20}$/;
  if (!phoneRegex.test(contactNumber)) {
    const error = new Error('Invalid contact number format');
    error.statusCode = 400;
    error.code = 'INVALID_CONTACT';
    throw error;
  }
};

/**
 * Validate cross-database references
 */
const validateReferences = async (classId, sourceId) => {
  // Validate class_id exists in common_db
  const classExists = await validateClassExists(classId);
  if (!classExists) {
    const error = new Error(`Class with ID ${classId} not found`);
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  // Validate source_id exists in common_db
  const sourceExists = await validateEnquirySourceExists(sourceId);
  if (!sourceExists) {
    const error = new Error(`Enquiry source with ID ${sourceId} not found`);
    error.statusCode = 404;
    error.code = 'SOURCE_NOT_FOUND';
    throw error;
  }
};

/**
 * Get all enquiries (with optional filters)
 */
const getAllEnquiries = async (user, filters = {}) => {
  assertAdminRole(user);

  const { status, class_id, from_date, to_date, limit, offset } = filters;

  // Validate status filter if provided
  if (status) {
    validateFilterStatus(status);
  }

  // Pass status to repository (it will ignore if it's 'All')
  const enquiries = await enquiriesRepository.getAllEnquiries({
    schoolId: user.school_id,
    status: status === 'All' ? null : status, // Pass null if status is 'All' to get all
    classId: class_id,
    fromDate: from_date,
    toDate: to_date,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  });

  return {
    success: true,
    data: enquiries,
    count: enquiries.length,
    filters: {
      status: status || 'All',
      class_id: class_id || 'all',
      from_date: from_date || null,
      to_date: to_date || null
    }
  };
};

/**
 * Get single enquiry by ID
 */
const getEnquiryById = async (user, enquiryId) => {
  assertAdminRole(user);

  const enquiry = await enquiriesRepository.getEnquiryById({
    schoolId: user.school_id,
    enquiryId
  });

  if (!enquiry) {
    const error = new Error('Enquiry not found');
    error.statusCode = 404;
    error.code = 'ENQUIRY_NOT_FOUND';
    throw error;
  }

  return {
    success: true,
    data: enquiry
  };
};

/**
 * Create new enquiry
 */
const createEnquiry = async (user, enquiryData, authToken) => {
  assertAdminRole(user);

  // Validate required fields
  validateRequiredFields(enquiryData);

  // Validate formats
  validateEmail(enquiryData.email);
  validateContactNumber(enquiryData.contact_number);

  // Validate enquiry status if provided
  if (enquiryData.enquiry_status) {
    validateEnquiryStatus(enquiryData.enquiry_status);
  }

  // Validate cross-database references
  await validateReferences(enquiryData.class_id, enquiryData.source_id);

  // Add school_id from JWT
  const dataToInsert = {
    ...enquiryData,
    school_id: user.school_id
  };

  const newEnquiry = await enquiriesRepository.createEnquiry(dataToInsert);

  return {
    success: true,
    message: 'Student enquiry created successfully',
    data: newEnquiry
  };
};

/**
 * Update enquiry
 */
const updateEnquiry = async (user, enquiryId, updateData, authToken) => {
  assertAdminRole(user);

  // Check if enquiry exists
  const existing = await enquiriesRepository.getEnquiryById({
    schoolId: user.school_id,
    enquiryId
  });

  if (!existing) {
    const error = new Error('Enquiry not found');
    error.statusCode = 404;
    error.code = 'ENQUIRY_NOT_FOUND';
    throw error;
  }

  // Validate required fields (excluding enquiry_status as it's optional in PUT)
  const requiredFields = ['student_name', 'father_name', 'contact_number', 'class_id', 'academic_year', 'preferred_medium', 'source_id'];
  const missing = requiredFields.filter(field => !updateData[field]);
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = { missing_fields: missing };
    throw error;
  }

  // Validate formats
  validateEmail(updateData.email);
  validateContactNumber(updateData.contact_number);

  // Validate enquiry status if provided, otherwise keep existing
  if (updateData.enquiry_status) {
    validateEnquiryStatus(updateData.enquiry_status);
  } else {
    updateData.enquiry_status = existing.enquiry_status; // Keep existing status
  }

  // Validate cross-database references if they changed
  if (updateData.class_id !== existing.class_id || updateData.source_id !== existing.source_id) {
    await validateReferences(updateData.class_id, updateData.source_id);
  }

  const updated = await enquiriesRepository.updateEnquiry({
    schoolId: user.school_id,
    enquiryId,
    updateData
  });

  return {
    success: true,
    message: 'Enquiry updated successfully',
    data: updated
  };
};

/**
 * Update only enquiry status (PATCH endpoint)
 */
const updateEnquiryStatus = async (user, enquiryId, status) => {
  assertAdminRole(user);

  // Validate status
  validateEnquiryStatus(status);

  // Check if enquiry exists
  const existing = await enquiriesRepository.getEnquiryById({
    schoolId: user.school_id,
    enquiryId
  });

  if (!existing) {
    const error = new Error('Enquiry not found');
    error.statusCode = 404;
    error.code = 'ENQUIRY_NOT_FOUND';
    throw error;
  }

  const updated = await enquiriesRepository.updateEnquiryStatus({
    schoolId: user.school_id,
    enquiryId,
    status
  });

  return {
    success: true,
    message: 'Enquiry status updated successfully',
    old_status: existing.enquiry_status,
    new_status: updated.enquiry_status,
    updated_at: updated.updated_at
  };
};

/**
 * Delete enquiry
 */
const deleteEnquiry = async (user, enquiryId) => {
  assertAdminRole(user);

  const deleted = await enquiriesRepository.deleteEnquiry({
    schoolId: user.school_id,
    enquiryId
  });

  if (!deleted) {
    const error = new Error('Enquiry not found');
    error.statusCode = 404;
    error.code = 'ENQUIRY_NOT_FOUND';
    throw error;
  }

  return {
    success: true,
    message: 'Enquiry deleted successfully',
    deleted_id: deleted.id,
    student_name: deleted.student_name
  };
};

/**
 * Get enquiry statistics by status
 */
const getEnquiryStats = async (user) => {
  assertAdminRole(user);

  const stats = await enquiriesRepository.getEnquiryCountByStatus({
    schoolId: user.school_id
  });

  // Transform to object for easier consumption
  const statsObject = stats.reduce((acc, row) => {
    acc[row.enquiry_status.toLowerCase()] = parseInt(row.count, 10);
    return acc;
  }, {});

  const total = stats.reduce((sum, row) => sum + parseInt(row.count, 10), 0);

  return {
    success: true,
    data: {
      total,
      by_status: statsObject
    }
  };
};

/**
 * Auto-transition enquiries from "New" to "Follow-up" after 24 hours
 * This function is called by a scheduled job (node-cron)
 */
const autoTransitionNewEnquiries = async () => {
  try {
    const updated = await enquiriesRepository.updateOldNewEnquiries();

    if (updated && updated.length > 0) {
      console.log(`[Auto-Transition] Converted ${updated.length} enquiries from "New" to "Follow-up" status`);
    }

    return {
      success: true,
      message: 'Auto-transition job completed',
      updated_count: updated ? updated.length : 0
    };
  } catch (error) {
    console.error('[Auto-Transition] Error occurred:', error.message);
    return {
      success: false,
      message: 'Auto-transition job failed',
      error: error.message
    };
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
  autoTransitionNewEnquiries
};
