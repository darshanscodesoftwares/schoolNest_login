const examsRepository = require("./exams.repository");
const { commonApiGet } = require("../../../utils/common-api.client");

// Valid exam statuses
const EXAM_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'PUBLISHED'];

/**
 * Calculate exam status automatically based on current date
 * UPCOMING: start_date > today
 * ONGOING: start_date <= today <= end_date
 * COMPLETED: today > end_date (and status != PUBLISHED)
 * PUBLISHED: status is already PUBLISHED (don't auto-downgrade)
 */
const calculateExamStatus = (exam) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison

  const startDate = new Date(exam.start_date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(exam.end_date);
  endDate.setHours(0, 0, 0, 0);

  // If already published, keep it published (don't auto-downgrade)
  if (exam.status === 'PUBLISHED') {
    return 'PUBLISHED';
  }

  // Check date ranges
  if (startDate > today) {
    return 'UPCOMING';
  } else if (startDate <= today && today <= endDate) {
    return 'ONGOING';
  } else {
    return 'COMPLETED';
  }
};

/**
 * Enrich exam with calculated status
 */
const enrichExamWithStatus = (exam) => {
  return {
    ...exam,
    status: calculateExamStatus(exam),
  };
};

/**
 * Enrich multiple exams with calculated status
 */
const enrichExamsWithStatus = (exams) => {
  return exams.map(enrichExamWithStatus);
};

const examsService = {
  // Validate admin role
  validateAdminRole: (user) => {
    if (!user || user.role !== "ADMIN") {
      const error = new Error("Access denied. Admin role required.");
      error.statusCode = 403;
      throw error;
    }
  },

  // Validate exam status
  validateExamStatus: (status) => {
    if (!status || !EXAM_STATUSES.includes(status)) {
      const error = new Error(
        `Invalid status. Must be one of: ${EXAM_STATUSES.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }
  },

  // Create new exam
  createExam: async (user, school_id, examData) => {
    examsService.validateAdminRole(user);

    const { exam_name, academic_year, start_date, end_date } = examData;

    // Validate required fields
    if (!exam_name || !academic_year || !start_date || !end_date) {
      const error = new Error(
        "Missing required fields: exam_name, academic_year, start_date, end_date"
      );
      error.statusCode = 400;
      throw error;
    }

    // Validate date logic
    if (new Date(start_date) > new Date(end_date)) {
      const error = new Error("start_date must be before end_date");
      error.statusCode = 400;
      throw error;
    }

    return await examsRepository.createExam(school_id, examData);
  },

  // Get all exams for school
  getAllExams: async (user, school_id) => {
    examsService.validateAdminRole(user);
    const exams = await examsRepository.getAllExams(school_id);
    // Enrich with calculated status based on current date
    return enrichExamsWithStatus(exams);
  },

  // Get exam by ID
  getExamById: async (user, school_id, exam_id) => {
    examsService.validateAdminRole(user);

    const exam = await examsRepository.getExamWithDetails(school_id, exam_id);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    // Enrich with calculated status based on current date
    return enrichExamWithStatus(exam);
  },

  // Update exam
  updateExam: async (user, school_id, exam_id, updateData) => {
    examsService.validateAdminRole(user);

    // Check if exam exists
    const exam = await examsRepository.getExamById(school_id, exam_id);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate date logic if dates are provided
    if (updateData.start_date && updateData.end_date) {
      if (new Date(updateData.start_date) > new Date(updateData.end_date)) {
        const error = new Error("start_date must be before end_date");
        error.statusCode = 400;
        throw error;
      }
    }

    return await examsRepository.updateExam(school_id, exam_id, updateData);
  },

  // Delete exam
  deleteExam: async (user, school_id, exam_id) => {
    examsService.validateAdminRole(user);

    const exam = await examsRepository.getExamById(school_id, exam_id);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    return await examsRepository.deleteExam(school_id, exam_id);
  },

  // Create exam with multiple details
  createExamWithDetails: async (user, school_id, examData, detailsArray) => {
    examsService.validateAdminRole(user);

    const { exam_name, academic_year, start_date, end_date } = examData;

    // Validate required fields
    if (!exam_name || !academic_year || !start_date || !end_date) {
      const error = new Error(
        "Missing required fields: exam_name, academic_year, start_date, end_date"
      );
      error.statusCode = 400;
      throw error;
    }

    // Validate date logic
    if (new Date(start_date) > new Date(end_date)) {
      const error = new Error("start_date must be before end_date");
      error.statusCode = 400;
      throw error;
    }

    // Validate details array
    if (!Array.isArray(detailsArray) || detailsArray.length === 0) {
      const error = new Error("At least one exam detail is required");
      error.statusCode = 400;
      throw error;
    }

    // Validate and convert subject_name to subject_id
    const processedDetails = [];
    for (const detail of detailsArray) {
      const {
        class_id,
        section_id,
        subject_name,
        exam_date,
        max_marks,
        pass_marks,
        teacher_id,
      } = detail;

      if (
        !class_id ||
        !section_id ||
        !subject_name ||
        !exam_date ||
        max_marks === undefined ||
        pass_marks === undefined ||
        !teacher_id
      ) {
        const error = new Error(
          "Missing required fields in exam details: class_id, section_id, subject_name, exam_date, max_marks, pass_marks, teacher_id"
        );
        error.statusCode = 400;
        throw error;
      }

      // Validate marks
      if (max_marks <= 0) {
        const error = new Error("max_marks must be greater than 0");
        error.statusCode = 400;
        throw error;
      }

      if (pass_marks < 0 || pass_marks > max_marks) {
        const error = new Error(
          "pass_marks must be between 0 and max_marks"
        );
        error.statusCode = 400;
        throw error;
      }

      // Get or create subject and get its ID
      const subject_id = await examsRepository.getOrCreateSubject(
        school_id,
        subject_name
      );

      processedDetails.push({
        class_id,
        section_id,
        subject_id,
        exam_date,
        max_marks,
        pass_marks,
        teacher_id,
      });
    }

    // Create exam first
    const exam = await examsRepository.createExam(school_id, examData);

    // Create exam details
    const details = await examsRepository.createBatchExamDetails(
      school_id,
      exam.id,
      processedDetails
    );

    return {
      exam,
      details,
    };
  },

  // Unified update: update exam + replace all details in one transaction
  updateExamUnified: async (user, school_id, exam_id, examData, detailsArray) => {
    examsService.validateAdminRole(user);

    // Check if exam exists
    const exam = await examsRepository.getExamById(school_id, exam_id);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate date logic if both dates provided
    if (examData.start_date && examData.end_date) {
      if (new Date(examData.start_date) > new Date(examData.end_date)) {
        const error = new Error("start_date must be before end_date");
        error.statusCode = 400;
        throw error;
      }
    }

    // Process and validate details
    const processedDetails = [];
    for (const detail of detailsArray) {
      const { class_id, section_id, subject_name, exam_date, max_marks, pass_marks, teacher_id } = detail;

      if (!class_id || !section_id || !subject_name || !exam_date || max_marks === undefined || pass_marks === undefined || !teacher_id) {
        const error = new Error("Missing required fields in details: class_id, section_id, subject_name, exam_date, max_marks, pass_marks, teacher_id");
        error.statusCode = 400;
        throw error;
      }

      if (max_marks <= 0) {
        const error = new Error("max_marks must be greater than 0");
        error.statusCode = 400;
        throw error;
      }

      if (pass_marks < 0 || pass_marks > max_marks) {
        const error = new Error("pass_marks must be between 0 and max_marks");
        error.statusCode = 400;
        throw error;
      }

      const subject_id = await examsRepository.getOrCreateSubject(school_id, subject_name);

      processedDetails.push({ class_id, section_id, subject_id, exam_date, max_marks, pass_marks, teacher_id });
    }

    // Update exam fields
    const updatedExam = await examsRepository.updateExam(school_id, exam_id, examData);

    // Delete existing details and recreate with new ones
    await examsRepository.deleteExamDetailsByExamId(school_id, exam_id);

    let details = [];
    if (processedDetails.length > 0) {
      details = await examsRepository.createBatchExamDetails(school_id, exam_id, processedDetails);
    }

    return { exam: enrichExamWithStatus(updatedExam), details };
  },

  // Get exam details
  getExamDetails: async (user, school_id, exam_id) => {
    examsService.validateAdminRole(user);

    const exam = await examsRepository.getExamById(school_id, exam_id);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    return await examsRepository.getExamDetailsByExamId(school_id, exam_id);
  },

  // Update exam detail
  updateExamDetail: async (user, school_id, detail_id, updateData) => {
    examsService.validateAdminRole(user);

    const detail = await examsRepository.getExamDetailById(school_id, detail_id);
    if (!detail) {
      const error = new Error("Exam detail not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate marks if provided
    if (updateData.max_marks !== undefined || updateData.pass_marks !== undefined) {
      const max_marks = updateData.max_marks || detail.max_marks;
      const pass_marks = updateData.pass_marks !== undefined ? updateData.pass_marks : detail.pass_marks;

      if (max_marks <= 0) {
        const error = new Error("max_marks must be greater than 0");
        error.statusCode = 400;
        throw error;
      }

      if (pass_marks < 0 || pass_marks > max_marks) {
        const error = new Error(
          "pass_marks must be between 0 and max_marks"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    return await examsRepository.updateExamDetail(
      school_id,
      detail_id,
      updateData
    );
  },

  // Create exam detail (single)
  createExamDetail: async (user, school_id, exam_id, detailData) => {
    examsService.validateAdminRole(user);

    const {
      class_id,
      section_id,
      subject_name,
      exam_date,
      max_marks,
      pass_marks,
      teacher_id,
    } = detailData;

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
      const error = new Error(
        "Missing required fields: class_id, section_id, subject_name, exam_date, max_marks, pass_marks, teacher_id"
      );
      error.statusCode = 400;
      throw error;
    }

    // Validate marks
    if (max_marks <= 0) {
      const error = new Error("max_marks must be greater than 0");
      error.statusCode = 400;
      throw error;
    }

    if (pass_marks < 0 || pass_marks > max_marks) {
      const error = new Error("pass_marks must be between 0 and max_marks");
      error.statusCode = 400;
      throw error;
    }

    // Get or create subject
    const subject_id = await examsRepository.getOrCreateSubject(
      school_id,
      subject_name
    );

    // Create detail
    const detailWithSubjectId = {
      exam_id,
      class_id,
      section_id,
      subject_id,
      exam_date,
      max_marks,
      pass_marks,
      teacher_id,
    };

    return await examsRepository.createExamDetail(school_id, detailWithSubjectId);
  },

  // Delete exam detail
  deleteExamDetail: async (user, school_id, detail_id) => {
    examsService.validateAdminRole(user);

    const detail = await examsRepository.getExamDetailById(school_id, detail_id);
    if (!detail) {
      const error = new Error("Exam detail not found");
      error.statusCode = 404;
      throw error;
    }

    return await examsRepository.deleteExamDetail(school_id, detail_id);
  },

  // Get exams by academic year
  getExamsByAcademicYear: async (user, school_id, academic_year) => {
    examsService.validateAdminRole(user);

    if (!academic_year) {
      const error = new Error("academic_year is required");
      error.statusCode = 400;
      throw error;
    }

    const exams = await examsRepository.getExamsByAcademicYear(
      school_id,
      academic_year
    );
    // Enrich with calculated status based on current date
    return enrichExamsWithStatus(exams);
  },

  // Update exam status
  updateExamStatus: async (user, school_id, exam_id, status) => {
    examsService.validateAdminRole(user);

    // Validate exam exists
    const exam = await examsRepository.getExamById(school_id, exam_id);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate status value
    examsService.validateExamStatus(status);

    return await examsRepository.updateExamStatus(school_id, exam_id, status);
  },

  // Get exams by status
  getExamsByStatus: async (user, school_id, status) => {
    examsService.validateAdminRole(user);

    if (!status) {
      const error = new Error("status is required");
      error.statusCode = 400;
      throw error;
    }

    // Validate status value
    examsService.validateExamStatus(status);

    // Get all exams and filter by calculated status
    const allExams = await examsRepository.getAllExams(school_id);
    const enrichedExams = enrichExamsWithStatus(allExams);

    // Filter by requested status
    return enrichedExams.filter(exam => exam.status === status);
  },
};

module.exports = examsService;
