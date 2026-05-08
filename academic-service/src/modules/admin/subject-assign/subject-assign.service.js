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
  // Create assignments for a school's subject (catalog-driven).
  //
  // New contract: caller MUST provide catalog_id (the global subject) + each
  // assignment carries class_id, section_name, teacher_id. The school's
  // `subjects` row for that catalog entry is created on demand (idempotent).
  //
  // Legacy contract: subject_name + class-only assignments. Kept so older
  // callers still work — but the resulting rows have section_name = NULL,
  // which the new EDIT flow will surface for cleanup.
  createSubjectWithAssignments: async (
    user,
    school_id,
    subject_name,
    classAssignments,
    catalog_id // optional; preferred path
  ) => {
    assertAdminRole(user);

    if (!school_id || !classAssignments || classAssignments.length === 0) {
      const error = new Error(
        "Missing required fields: school_id, classAssignments"
      );
      error.statusCode = 400;
      throw error;
    }

    if (!catalog_id && !subject_name) {
      const error = new Error("Either catalog_id or subject_name is required");
      error.statusCode = 400;
      throw error;
    }

    const pool = require("../../../config/db");
    for (const assignment of classAssignments) {
      if (!assignment.class_id || !assignment.teacher_id) {
        const error = new Error(
          "Each assignment must have class_id and teacher_id"
        );
        error.statusCode = 400;
        throw error;
      }
      // section_name is optional for legacy callers but required for catalog flow
      if (catalog_id && !assignment.section_name) {
        const error = new Error(
          "Each assignment must include section_name when using catalog_id"
        );
        error.statusCode = 400;
        throw error;
      }

      try {
        const teacherCheck = await pool.query(
          `SELECT id FROM teacher_records WHERE id = $1::uuid AND school_id = $2 LIMIT 1`,
          [assignment.teacher_id, school_id]
        );
        if (!teacherCheck.rows || teacherCheck.rows.length === 0) {
          const error = new Error(
            `Invalid teacher_id: ${assignment.teacher_id}. Teacher not found in school.`
          );
          error.statusCode = 400;
          throw error;
        }
      } catch (err) {
        if (err.statusCode === 400) throw err;
        const error = new Error(
          `Invalid teacher_id format: ${assignment.teacher_id}. Must be a valid UUID.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Resolve the subjects row — prefer catalog import, fall back to legacy
    let subject;
    if (catalog_id) {
      subject = await subjectAssignRepository.importFromCatalog({
        school_id,
        catalog_id,
      });
    } else {
      subject = await subjectAssignRepository.getSubjectByName({
        school_id,
        subject_name,
      });
      if (!subject) {
        subject = await subjectAssignRepository.createSubject({
          school_id,
          subject_name,
        });
      }
    }

    const assignmentsToCreate = classAssignments.map((a) => ({
      school_id,
      subject_id: subject.id,
      class_id: a.class_id,
      section_name: a.section_name || null,
      teacher_id: a.teacher_id,
      sequence: a.sequence,
    }));

    const results = await subjectAssignRepository.createBatchSubjectClassAssign(
      assignmentsToCreate
    );

    return { subject, assignments: results };
  },

  // Bulk replace ALL assignments for one of the school's subjects. Powers the
  // EDIT modal's Save button — caller sends the desired final list, server
  // diffs and applies inserts/updates/deletes in one transaction.
  bulkReplaceAssignments: async ({
    user,
    school_id,
    subject_id,
    catalog_id, // optional: re-point this subject at a different catalog entry
    assignments,
  }) => {
    assertAdminRole(user);

    if (!school_id || !subject_id || !Array.isArray(assignments)) {
      const error = new Error("school_id, subject_id, assignments[] are required");
      error.statusCode = 400;
      throw error;
    }

    // Validate every assignment up front
    const pool = require("../../../config/db");
    for (const a of assignments) {
      if (!a.class_id || !a.section_name || !a.teacher_id) {
        const error = new Error(
          "Each assignment must include class_id, section_name, teacher_id"
        );
        error.statusCode = 400;
        throw error;
      }
      const teacherCheck = await pool.query(
        `SELECT id FROM teacher_records WHERE id = $1::uuid AND school_id = $2 LIMIT 1`,
        [a.teacher_id, school_id]
      );
      if (!teacherCheck.rows[0]) {
        const error = new Error(`Invalid teacher_id: ${a.teacher_id}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Re-point catalog if requested
    if (catalog_id) {
      await pool.query(
        `UPDATE subjects
         SET catalog_id = $1::uuid,
             subject_name = COALESCE((SELECT subject_name FROM subject_catalog WHERE id = $1::uuid), subject_name),
             updated_at = NOW()
         WHERE id = $2::uuid AND school_id = $3`,
        [catalog_id, subject_id, school_id]
      );
    }

    const results = await subjectAssignRepository.bulkReplaceAssignments({
      school_id,
      subject_id,
      assignments,
    });

    return { subject_id, assignments: results };
  },

  // List all (subject, class, section) a teacher is assigned to in this school.
  getAssignmentsForTeacher: async ({ user, school_id, teacher_id }) => {
    assertAdminRole(user);
    if (!school_id || !teacher_id) {
      const error = new Error("school_id and teacher_id are required");
      error.statusCode = 400;
      throw error;
    }
    return subjectAssignRepository.getAssignmentsForTeacher({ school_id, teacher_id });
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

    // Validate teacher_id is a valid UUID and exists in teacher_records
    const pool = require("../../../config/db");
    try {
      const teacherCheck = await pool.query(
        `SELECT id FROM teacher_records WHERE id = $1::uuid AND school_id = $2 LIMIT 1`,
        [teacher_id, school_id]
      );

      if (!teacherCheck.rows || teacherCheck.rows.length === 0) {
        const error = new Error(
          `Invalid teacher_id: ${teacher_id}. Teacher not found in school.`
        );
        error.statusCode = 400;
        throw error;
      }
    } catch (err) {
      if (err.statusCode === 400) throw err;
      // If UUID cast fails, teacher_id is invalid format
      const error = new Error(
        `Invalid teacher_id format: ${teacher_id}. Must be a valid UUID.`
      );
      error.statusCode = 400;
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
