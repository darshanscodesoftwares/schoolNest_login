const subjectAssignRepository = require("./subject-assign.repository");

/**
 * Validate admin role
 */
const assertAdminRole = (user) => {
  if (!user || user.role !== "ADMIN") {
    const error = new Error(
      "Forbidden: only administrators can access this resource"
    );
    error.statusCode = 403;
    error.code = "INSUFFICIENT_PERMISSIONS";
    throw error;
  }
};

const subjectAssignService = {
  // Create subject with batch class assignments
  createSubjectWithAssignments: async (
    user,
    school_id,
    subject_name,
    classAssignments
  ) => {
    assertAdminRole(user);

    if (!school_id || !subject_name || !classAssignments || classAssignments.length === 0) {
      const error = new Error(
        "Missing required fields: school_id, subject_name, classAssignments"
      );
      error.statusCode = 400;
      throw error;
    }

    // Validate each assignment
    for (const assignment of classAssignments) {
      if (!assignment.class_id || !assignment.teacher_id) {
        const error = new Error(
          "Each assignment must have class_id and teacher_id"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Create subject
    const subject = await subjectAssignRepository.createSubject({
      school_id,
      subject_name,
    });

    // Create batch assignments
    const assignmentsToCreate = classAssignments.map((assignment) => ({
      school_id,
      subject_id: subject.id,
      class_id: assignment.class_id,
      teacher_id: assignment.teacher_id,
    }));

    const results = await subjectAssignRepository.createBatchSubjectClassAssign(
      assignmentsToCreate
    );

    return {
      subject,
      assignments: results,
    };
  },

  // Get all subjects for a school
  getAllSubjects: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    return await subjectAssignRepository.getAllSubjects(school_id);
  },

  // Get subject by ID
  getSubjectById: async (user, school_id, subject_id) => {
    assertAdminRole(user);

    if (!school_id || !subject_id) {
      const error = new Error(
        "Missing required fields: school_id, subject_id"
      );
      error.statusCode = 400;
      throw error;
    }

    const subject = await subjectAssignRepository.getSubjectById(
      school_id,
      subject_id
    );

    if (!subject) {
      const error = new Error("Subject not found");
      error.statusCode = 404;
      throw error;
    }

    return subject;
  },

  // Get subject with all class assignments
  getSubjectWithAssignments: async (user, school_id, subject_id) => {
    assertAdminRole(user);

    if (!school_id || !subject_id) {
      const error = new Error(
        "Missing required fields: school_id, subject_id"
      );
      error.statusCode = 400;
      throw error;
    }

    const subject = await subjectAssignRepository.getSubjectById(
      school_id,
      subject_id
    );

    if (!subject) {
      const error = new Error("Subject not found");
      error.statusCode = 404;
      throw error;
    }

    const assignments =
      await subjectAssignRepository.getSubjectClassAssignments(
        school_id,
        subject_id
      );

    return {
      ...subject,
      assignments,
    };
  },

  // Update subject name
  updateSubject: async (user, school_id, subject_id, subject_name) => {
    assertAdminRole(user);

    if (!school_id || !subject_id || !subject_name) {
      const error = new Error(
        "Missing required fields: school_id, subject_id, subject_name"
      );
      error.statusCode = 400;
      throw error;
    }

    // Verify subject exists
    const subject = await subjectAssignRepository.getSubjectById(
      school_id,
      subject_id
    );

    if (!subject) {
      const error = new Error("Subject not found");
      error.statusCode = 404;
      throw error;
    }

    return await subjectAssignRepository.updateSubject(
      school_id,
      subject_id,
      subject_name
    );
  },

  // Update assignment (change teacher)
  updateAssignment: async (user, school_id, assignment_id, teacher_id) => {
    assertAdminRole(user);

    if (!school_id || !assignment_id || !teacher_id) {
      const error = new Error(
        "Missing required fields: school_id, assignment_id, teacher_id"
      );
      error.statusCode = 400;
      throw error;
    }

    return await subjectAssignRepository.updateSubjectClassAssign(
      school_id,
      assignment_id,
      teacher_id
    );
  },

  // Delete assignment
  deleteAssignment: async (user, school_id, assignment_id) => {
    assertAdminRole(user);

    if (!school_id || !assignment_id) {
      const error = new Error(
        "Missing required fields: school_id, assignment_id"
      );
      error.statusCode = 400;
      throw error;
    }

    const deleted = await subjectAssignRepository.deleteSubjectClassAssign(
      school_id,
      assignment_id
    );

    if (!deleted) {
      const error = new Error("Assignment not found");
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  },

  // Delete subject (cascades to assignments)
  deleteSubject: async (user, school_id, subject_id) => {
    assertAdminRole(user);

    if (!school_id || !subject_id) {
      const error = new Error(
        "Missing required fields: school_id, subject_id"
      );
      error.statusCode = 400;
      throw error;
    }

    const deleted = await subjectAssignRepository.deleteSubject(
      school_id,
      subject_id
    );

    if (!deleted) {
      const error = new Error("Subject not found");
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  },

  // Get all subjects with assignments
  getAllSubjectsWithAssignments: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    return await subjectAssignRepository.getAllSubjectsWithAssignments(
      school_id
    );
  },

  // Check if assigned classes form a full range (LKG to 12th)
  isFullClassRange: async (assignedClassIds, totalClassCount) => {
    return await subjectAssignRepository.isFullClassRange(assignedClassIds, totalClassCount);
  },

  // Get all subjects and teachers for a specific class
  getSubjectsAndTeachersByClass: async (user, school_id, class_id) => {
    assertAdminRole(user);

    if (!school_id || !class_id) {
      const error = new Error(
        "Missing required fields: school_id, class_id"
      );
      error.statusCode = 400;
      throw error;
    }

    return await subjectAssignRepository.getSubjectsAndTeachersByClass(
      school_id,
      class_id
    );
  },

  // Get all classes with their subjects and teachers
  getAllClassesWithSubjectsAndTeachers: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    return await subjectAssignRepository.getAllClassesWithSubjectsAndTeachers(
      school_id
    );
  },

  // Update teacher for a subject in a specific class
  updateTeacherByClassAndSubject: async (user, school_id, class_id, subject_id, teacher_id) => {
    assertAdminRole(user);

    if (!school_id || !class_id || !subject_id || !teacher_id) {
      const error = new Error(
        "Missing required fields: school_id, class_id, subject_id, teacher_id"
      );
      error.statusCode = 400;
      throw error;
    }

    // Verify assignment exists
    const assignment = await subjectAssignRepository.getAssignmentByClassAndSubject(
      school_id,
      class_id,
      subject_id
    );

    if (!assignment) {
      const error = new Error("Assignment not found for this class and subject");
      error.statusCode = 404;
      throw error;
    }

    return await subjectAssignRepository.updateTeacherByClassAndSubject(
      school_id,
      class_id,
      subject_id,
      teacher_id
    );
  },
};

module.exports = subjectAssignService;
