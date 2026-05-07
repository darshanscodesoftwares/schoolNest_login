const classesAssignRepository = require("./classes-assign.repository");
const pool = require("../../../config/db");

// ─── Bridge 3: class assignment → sync to teacher/parent `classes` table ─────
// After admin assigns a teacher to a class-section, create the corresponding
// entry in the `classes` table that teacher/parent modules read from.
// One entry is created per (class_name, section, teacher) triplet.
// Subject uses 'General' as placeholder — subject-assign module populates it later.
const syncToClassesTable = async (school_id, class_id, section_name, teacher_id) => {
  try {
    // Get class name from school_classes
    const classRes = await pool.query(
      `SELECT class_name FROM school_classes WHERE id = $1 LIMIT 1`,
      [class_id]
    );
    if (!classRes.rows[0]) return;

    const className = classRes.rows[0].class_name;

    // Claim Bridge 2 placeholder if one exists — updates in-place so students' class_id refs stay valid.
    // Otherwise insert a fresh row.
    const placeholderRes = await pool.query(
      `SELECT id FROM classes WHERE school_id = $1 AND name = $2 AND section = $3 AND teacher_id = 'SYSTEM' LIMIT 1`,
      [school_id, className, section_name]
    );

    if (placeholderRes.rows[0]) {
      await pool.query(
        `UPDATE classes SET teacher_id = $1, subject = 'General' WHERE id = $2`,
        [teacher_id, placeholderRes.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO classes (school_id, name, section, subject, teacher_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [school_id, className, section_name, 'General', teacher_id]
      );
    }

    console.log(`Bridge 3: classes table synced — ${className} ${section_name} → teacher ${teacher_id}`);
  } catch (error) {
    console.error('Bridge 3 error:', error.message);
  }
};

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

const classesAssignService = {
  // Create batch assignments for a class (handles multiple sections and teachers)
  createAssignments: async (user, school_id, class_id, assignments) => {
    assertAdminRole(user);

    if (!school_id || !class_id || !assignments || assignments.length === 0) {
      const error = new Error("Missing required fields: school_id, class_id, assignments");
      error.statusCode = 400;
      throw error;
    }

    // Validate each assignment has section_name and teacher_id
    for (const assignment of assignments) {
      if (!assignment.section_name || !assignment.teacher_id) {
        const error = new Error("Each assignment must have section_name and teacher_id");
        error.statusCode = 400;
        throw error;
      }
    }

    // Check if assignments already exist
    for (const assignment of assignments) {
      const exists = await classesAssignRepository.checkAssignmentExists(
        school_id,
        class_id,
        assignment.section_name
      );
      if (exists) {
        const error = new Error(
          `Assignment already exists for section ${assignment.section_name}`
        );
        error.statusCode = 409;
        throw error;
      }
    }

    // Rule: each teacher can be class teacher of at most one (class, section).
    // Reject if any teacher in the payload is already assigned anywhere in this school,
    // or appears more than once in the same payload.
    const seenTeachers = new Set();
    for (const assignment of assignments) {
      if (seenTeachers.has(assignment.teacher_id)) {
        const error = new Error(
          `Teacher cannot be assigned to more than one section in the same submission`
        );
        error.statusCode = 409;
        error.code = 'TEACHER_ALREADY_ASSIGNED';
        throw error;
      }
      seenTeachers.add(assignment.teacher_id);

      const existing = await classesAssignRepository.getExistingTeacherAssignment(
        school_id,
        assignment.teacher_id
      );
      if (existing) {
        const where = existing.class_name
          ? `${existing.class_name} - ${existing.section_name}`
          : `section ${existing.section_name}`;
        const error = new Error(
          `Teacher is already class teacher of ${where}. A teacher can be class teacher of only one class-section.`
        );
        error.statusCode = 409;
        error.code = 'TEACHER_ALREADY_ASSIGNED';
        throw error;
      }
    }

    // Prepare assignments with school_id and class_id
    const assignmentsToCreate = assignments.map((assignment) => ({
      school_id,
      class_id,
      teacher_id: assignment.teacher_id,
      section_name: assignment.section_name,
    }));

    const results = await classesAssignRepository.createBatchAssignments(
      assignmentsToCreate
    );

    // Bridge 3: sync each new assignment to teacher/parent classes table
    for (const assignment of assignmentsToCreate) {
      await syncToClassesTable(school_id, class_id, assignment.section_name, assignment.teacher_id);
    }

    return results;
  },

  // Get all assignments for a school
  getAllAssignments: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    const assignments = await classesAssignRepository.getAllAssignments(school_id);
    return assignments;
  },

  // Get assignments for a specific class
  getAssignmentsByClass: async (user, school_id, class_id) => {
    assertAdminRole(user);

    if (!school_id || !class_id) {
      const error = new Error("Missing required fields: school_id, class_id");
      error.statusCode = 400;
      throw error;
    }

    const assignments = await classesAssignRepository.getAssignmentsByClass(
      school_id,
      class_id
    );
    return assignments;
  },

  // Get single assignment
  getAssignmentById: async (user, school_id, assignment_id) => {
    assertAdminRole(user);

    if (!school_id || !assignment_id) {
      const error = new Error("Missing required fields: school_id, assignment_id");
      error.statusCode = 400;
      throw error;
    }

    const assignment = await classesAssignRepository.getAssignmentById(
      school_id,
      assignment_id
    );

    if (!assignment) {
      const error = new Error("Assignment not found");
      error.statusCode = 404;
      throw error;
    }

    return assignment;
  },

  // Update assignment
  updateAssignment: async (user, school_id, assignment_id, teacher_id, section_name) => {
    assertAdminRole(user);

    if (!school_id || !assignment_id) {
      const error = new Error("Missing required fields: school_id, assignment_id");
      error.statusCode = 400;
      throw error;
    }

    // Verify assignment exists
    const assignment = await classesAssignRepository.getAssignmentById(
      school_id,
      assignment_id
    );

    if (!assignment) {
      const error = new Error("Assignment not found");
      error.statusCode = 404;
      throw error;
    }

    const finalTeacherId = teacher_id || assignment.teacher_id;
    const finalSection   = section_name || assignment.section_name;

    // Rule (update path): if teacher is changing, the new teacher must not
    // already be class teacher of a different class-section.
    if (finalTeacherId && finalTeacherId !== assignment.teacher_id) {
      const existing = await classesAssignRepository.getExistingTeacherAssignment(
        school_id,
        finalTeacherId,
        assignment_id
      );
      if (existing) {
        const where = existing.class_name
          ? `${existing.class_name} - ${existing.section_name}`
          : `section ${existing.section_name}`;
        const error = new Error(
          `Teacher is already class teacher of ${where}. A teacher can be class teacher of only one class-section.`
        );
        error.statusCode = 409;
        error.code = 'TEACHER_ALREADY_ASSIGNED';
        throw error;
      }
    }

    const updated = await classesAssignRepository.updateAssignment({
      school_id,
      assignment_id,
      teacher_id: finalTeacherId,
      section_name: finalSection,
    });

    // Bridge 3: re-sync the updated assignment to classes table
    await syncToClassesTable(school_id, assignment.class_id, finalSection, finalTeacherId);

    return updated;
  },

  // Delete assignment
  deleteAssignment: async (user, school_id, assignment_id) => {
    assertAdminRole(user);

    if (!school_id || !assignment_id) {
      const error = new Error("Missing required fields: school_id, assignment_id");
      error.statusCode = 400;
      throw error;
    }

    const deleted = await classesAssignRepository.deleteAssignment(school_id, assignment_id);

    if (!deleted) {
      const error = new Error("Assignment not found");
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  },

  // Delete all assignments for a class (when class is deleted)
  deleteClassAssignments: async (user, school_id, class_id) => {
    assertAdminRole(user);

    if (!school_id || !class_id) {
      const error = new Error("Missing required fields: school_id, class_id");
      error.statusCode = 400;
      throw error;
    }

    await classesAssignRepository.deleteClassAssignments(school_id, class_id);
  },

  // Get student count for a class
  getStudentCountByClass: async (user, school_id, class_id) => {
    assertAdminRole(user);

    if (!school_id || !class_id) {
      const error = new Error("Missing required fields: school_id, class_id");
      error.statusCode = 400;
      throw error;
    }

    const studentCount = await classesAssignRepository.getStudentCountByClass(
      school_id,
      class_id
    );

    return studentCount;
  },

  // Get student count for a specific class and section
  getStudentCountByClassAndSection: async (user, school_id, class_id, section_name) => {
    assertAdminRole(user);

    if (!school_id || !class_id || !section_name) {
      const error = new Error("Missing required fields: school_id, class_id, section_name");
      error.statusCode = 400;
      throw error;
    }

    const studentCount = await classesAssignRepository.getStudentCountByClassAndSection(
      school_id,
      class_id,
      section_name
    );

    return studentCount;
  },

  // Get all active teachers list for a school
  getTeachersList: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    const teachers = await classesAssignRepository.getTeachersList(school_id);
    return teachers;
  },

  // Get all parents list for a school
  // Updated: Now supports optional filtering by classId and section
  getParentsList: async (user, school_id, filters = {}) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    const parents = await classesAssignRepository.getParentsList(school_id, filters);
    return parents;
  },

  // Get all unique sections
  getAllSections: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    const sections = await classesAssignRepository.getAllSections(school_id);
    return sections;
  },

  // Get all unique classes
  getAllClasses: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    const classes = await classesAssignRepository.getAllClasses(school_id);
    return classes;
  },
};

module.exports = classesAssignService;
