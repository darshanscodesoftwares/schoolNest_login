const examsService = require("./exams.service");
const { commonApiGet } = require("../../../utils/common-api.client");

// Helper to format date to readable format (MMM-DD-YYYY)
const formatDate = (date) => {
  if (!date) return null;
  const dateObj = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month}-${day}-${year}`;
};

// Helper to format exam with readable dates
const formatExam = (exam) => {
  return {
    ...exam,
    start_date: formatDate(exam.start_date),
    end_date: formatDate(exam.end_date),
  };
};

// Helper to format multiple exams
const formatExams = (exams) => {
  return exams.map(formatExam);
};

// Helper to get result status display label
// Only uses explicit database value - NO auto-determination
const getResultStatusLabel = (resultStatus) => {
  // Valid result status values
  const validStatuses = ['Not Started', 'Marks Pending', 'Ready to Publish', 'Published'];

  // Return the explicit value from database
  if (resultStatus && validStatuses.includes(resultStatus)) {
    return resultStatus;
  }

  // Default to 'Not Started' if not set
  return 'Not Started';
};

// Helper to enrich exams with class and teacher names
const enrichExamsWithClassAndSection = async (exams, school_id) => {
  return Promise.all(
    exams.map(async (exam) => {
      if (exam.details && Array.isArray(exam.details)) {
        exam.details = await Promise.all(
          exam.details.map(async (detail) => ({
            ...detail,
            exam_date: formatDate(detail.exam_date),
            class_name: await getClassName(detail.class_id),
            teacher_name: await getTeacherName(detail.teacher_id, school_id),
            result_status: getResultStatusLabel(detail.result_status),
            // section_name is already fetched from database
          }))
        );
      }
      return exam;
    })
  );
};

// Helper to get subject name from repository
const getSubjectName = async (subject_id) => {
  try {
    // For now, subject names are in the database
    // This can be expanded if needed for external API calls
    return null;
  } catch (error) {
    return null;
  }
};

// Helper to get teacher name from database (via repository)
// Instead of making external API calls, we fetch directly from repository
// to avoid N+1 API calls and improve performance
const getTeacherNameFromDB = async (school_id, teacher_id) => {
  try {
    // Query teacher_records table directly
    // Query by teacher_id column (which matches what's stored in exam_details)
    const pool = require("../../../config/db");
    const query = {
      text: `SELECT first_name FROM teacher_records WHERE teacher_id = $1 AND school_id = $2 LIMIT 1`,
      values: [teacher_id, school_id],
    };
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      return result.rows[0].first_name || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching teacher name:", error.message);
    return null;
  }
};

// Wrapper function that accepts teacher_id and gets school_id from context
// This will be called with teacher_id from exam details
const getTeacherName = async (teacher_id, school_id) => {
  return getTeacherNameFromDB(school_id, teacher_id);
};

// Helper to get class name from common API
const getClassName = async (class_id) => {
  try {
    const response = await commonApiGet(`/api/v1/classes/${class_id}`, null);
    if (response && response.success && response.data) {
      return response.data.class_name || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const examsController = {
  // POST /api/v1/academic/admin/exams
  // Create new exam with details
  createExam: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { exam_name, academic_year, start_date, end_date, details } = req.body;

      const result = await examsService.createExamWithDetails(
        user,
        school_id,
        { exam_name, academic_year, start_date, end_date },
        details || []
      );

      return res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: {
          exam: result.exam,
          details: result.details,
          total_details: result.details.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/exams
  // Get all exams for school
  getAllExams: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { academic_year } = req.query;

      let exams;
      if (academic_year) {
        exams = await examsService.getExamsByAcademicYear(
          user,
          school_id,
          academic_year
        );
      } else {
        exams = await examsService.getAllExams(user, school_id);
      }

      // Enrich with class, section, and teacher names
      const enrichedExams = await enrichExamsWithClassAndSection(exams, school_id);

      // Format dates to readable format
      const formattedExams = formatExams(enrichedExams);

      return res.status(200).json({
        success: true,
        message: "Exams retrieved successfully",
        data: {
          total_exams: formattedExams.length,
          exams: formattedExams,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/exams/:examId
  // Get exam by ID with all details
  getExamById: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;

      const exam = await examsService.getExamById(user, school_id, examId);

      // Enrich details with class and teacher names (section_name already from DB)
      if (exam.details && Array.isArray(exam.details)) {
        exam.details = await Promise.all(
          exam.details.map(async (detail) => ({
            ...detail,
            exam_date: formatDate(detail.exam_date),
            class_name: await getClassName(detail.class_id),
            teacher_name: await getTeacherName(detail.teacher_id, school_id),
            result_status: getResultStatusLabel(detail.result_status),
          }))
        );
      }

      // Format dates to readable format
      const formattedExam = formatExam(exam);

      return res.status(200).json({
        success: true,
        message: "Exam retrieved successfully",
        data: formattedExam,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/academic/admin/exams/:examId
  // Update exam
  updateExam: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;
      const { exam_name, academic_year, start_date, end_date } = req.body;

      const updatedExam = await examsService.updateExam(
        user,
        school_id,
        examId,
        { exam_name, academic_year, start_date, end_date }
      );

      // Format dates to readable format
      const formattedExam = formatExam(updatedExam);

      return res.status(200).json({
        success: true,
        message: "Exam updated successfully",
        data: formattedExam,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/academic/admin/exams/:examId
  // Unified update: exam fields + all details in one request
  updateExamUnified: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;
      const { exam_name, academic_year, start_date, end_date, details } = req.body;

      const result = await examsService.updateExamUnified(
        user,
        school_id,
        examId,
        { exam_name, academic_year, start_date, end_date },
        details || []
      );

      return res.status(200).json({
        success: true,
        message: "Exam updated successfully",
        data: {
          exam: formatExam(result.exam),
          details: result.details,
          total_details: result.details.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/academic/admin/exams/:examId
  // Delete exam (cascades to details)
  deleteExam: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;

      const deletedExam = await examsService.deleteExam(
        user,
        school_id,
        examId
      );

      // Format dates to readable format
      const formattedExam = formatExam(deletedExam);

      return res.status(200).json({
        success: true,
        message: "Exam deleted successfully",
        data: formattedExam,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/exams/:examId/details
  // Get all details for an exam
  getExamDetails: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;

      const details = await examsService.getExamDetails(
        user,
        school_id,
        examId
      );

      // Enrich with class and teacher names (section_name already from DB)
      const enrichedDetails = await Promise.all(
        details.map(async (detail) => ({
          ...detail,
          exam_date: formatDate(detail.exam_date),
          class_name: await getClassName(detail.class_id),
          teacher_name: await getTeacherName(detail.teacher_id, school_id),
          result_status: getResultStatusLabel(detail.result_status),
        }))
      );

      return res.status(200).json({
        success: true,
        message: "Exam details retrieved successfully",
        data: {
          exam_id: examId,
          total_details: enrichedDetails.length,
          details: enrichedDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/academic/admin/exams/:examId/details
  // Add exam detail to existing exam
  addExamDetail: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;
      const {
        class_id,
        section_id,
        subject_name,
        exam_date,
        max_marks,
        pass_marks,
        teacher_id,
      } = req.body;

      // Validate exam exists
      const exam = await examsService.getExamById(user, school_id, examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      // Validate required fields
      if (
        !class_id ||
        !section_id ||
        !subject_name ||
        !exam_date ||
        max_marks === undefined ||
        pass_marks === undefined ||
        !teacher_id
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: class_id, section_id, subject_name, exam_date, max_marks, pass_marks, teacher_id",
        });
      }

      // Validate marks
      if (max_marks <= 0) {
        return res.status(400).json({
          success: false,
          message: "max_marks must be greater than 0",
        });
      }

      if (pass_marks < 0 || pass_marks > max_marks) {
        return res.status(400).json({
          success: false,
          message: "pass_marks must be between 0 and max_marks",
        });
      }

      const detailData = {
        class_id,
        section_id,
        subject_name,
        exam_date,
        max_marks,
        pass_marks,
        teacher_id,
      };

      const detail = await examsService.createExamDetail(
        user,
        school_id,
        examId,
        detailData
      );

      return res.status(201).json({
        success: true,
        message: "Exam detail added successfully",
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/academic/admin/exams/details/:detailId
  // Update exam detail
  updateExamDetail: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { detailId } = req.params;
      const {
        exam_date,
        max_marks,
        pass_marks,
        teacher_id,
      } = req.body;

      const updatedDetail = await examsService.updateExamDetail(
        user,
        school_id,
        detailId,
        { exam_date, max_marks, pass_marks, teacher_id }
      );

      return res.status(200).json({
        success: true,
        message: "Exam detail updated successfully",
        data: updatedDetail,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/academic/admin/exams/details/:detailId
  // Delete exam detail
  deleteExamDetail: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { detailId } = req.params;

      const deletedDetail = await examsService.deleteExamDetail(
        user,
        school_id,
        detailId
      );

      return res.status(200).json({
        success: true,
        message: "Exam detail deleted successfully",
        data: deletedDetail,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/academic/admin/exams/:examId/status
  // Update exam status
  updateExamStatus: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { examId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const updatedExam = await examsService.updateExamStatus(
        user,
        school_id,
        examId,
        status
      );

      // Format dates to readable format
      const formattedExam = formatExam(updatedExam);

      return res.status(200).json({
        success: true,
        message: "Exam status updated successfully",
        data: formattedExam,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/exams/status/:status
  // Get exams by status
  getExamsByStatus: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { status } = req.params;

      const exams = await examsService.getExamsByStatus(
        user,
        school_id,
        status
      );

      // Enrich with class, section, and teacher names
      const enrichedExams = await enrichExamsWithClassAndSection(exams, school_id);

      // Format dates to readable format
      const formattedExams = formatExams(enrichedExams);

      return res.status(200).json({
        success: true,
        message: "Exams retrieved successfully",
        data: {
          total_exams: formattedExams.length,
          status: status,
          exams: formattedExams,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/academic/admin/exams/details/:detailId/result-status
  // Update result status for an exam detail
  updateResultStatus: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { detailId } = req.params;
      const { result_status } = req.body;

      // Validate result_status
      const validStatuses = ['Not Started', 'Marks Pending', 'Ready to Publish', 'Published'];
      if (!result_status || !validStatuses.includes(result_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid result status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Update result_status in database
      const pool = require("../../../config/db");
      const query = {
        text: `UPDATE exam_details
               SET result_status = $1, updated_at = NOW()
               WHERE id = $2 AND school_id = $3
               RETURNING *`,
        values: [result_status, detailId, school_id],
      };
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Exam detail not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Result status updated successfully",
        data: {
          detail_id: detailId,
          result_status: result_status,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/exams/result-status/summary
  // Get summary of result status for all exams in a school
  getResultStatusSummary: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;

      const pool = require("../../../config/db");
      const query = {
        text: `SELECT
                  ce.exam_name,
                  ce.status as exam_status,
                  ed.result_status,
                  COUNT(*) as count
               FROM exam_details ed
               JOIN create_exams ce ON ed.exam_id = ce.id
               WHERE ed.school_id = $1
               GROUP BY ce.exam_name, ce.status, ed.result_status
               ORDER BY ce.exam_name, ed.result_status`,
        values: [school_id],
      };
      const result = await pool.query(query);

      // Group by exam
      const summary = {};
      result.rows.forEach(row => {
        if (!summary[row.exam_name]) {
          summary[row.exam_name] = {
            exam_name: row.exam_name,
            exam_status: row.exam_status,
            statuses: {}
          };
        }
        summary[row.exam_name].statuses[row.result_status] = row.count;
      });

      return res.status(200).json({
        success: true,
        message: "Result status summary retrieved successfully",
        data: Object.values(summary),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examsController;
