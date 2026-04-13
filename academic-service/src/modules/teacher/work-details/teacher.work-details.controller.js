const workDetailsService = require('./teacher.work-details.service');

/**
 * Get logged-in teacher's work details
 * POST /api/v1/academic/teacher/my-work-details
 * Auth: JWT token with teacher_id and school_id
 */
const getMyWorkDetails = async (req, res, next) => {
  try {
    // Extract teacher info from JWT token (set by auth middleware)
    const { user_id: teacher_id, school_id } = req.user;

    // Validate token has required fields
    if (!teacher_id || !school_id) {
      const error = new Error('Invalid or missing teacher information in token');
      error.statusCode = 401;
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    // Get teacher's work details
    const workDetails = await workDetailsService.getMyWorkDetails(teacher_id, school_id);

    return res.status(200).json({
      success: true,
      message: 'Teacher work details retrieved successfully',
      data: workDetails
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMyWorkDetails };
