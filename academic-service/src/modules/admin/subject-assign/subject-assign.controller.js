const subjectAssignService = require("./subject-assign.service");
const { commonApiGet } = require("../../../utils/common-api.client");

// Cache for class names to avoid repeated API calls
const classNameCache = {};

// Helper function to fetch class name from database
const getClassName = async (classId) => {
  try {
    // Check cache first
    if (classNameCache[classId]) {
      return classNameCache[classId];
    }

    // Fetch from academic database
    const pool = require("../../../config/db");
    const result = await pool.query(
      `SELECT class_name FROM school_classes WHERE id = $1::uuid LIMIT 1`,
      [classId]
    );

    if (result.rows && result.rows[0]) {
      const className = result.rows[0].class_name;
      if (className) {
        classNameCache[classId] = className;
      }
      return className;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch class name for ${classId}:`, error.message);
    return null;
  }
};

// Helper function to fetch all classes with their names from academic service master data
const getAllClassesWithOrder = async () => {
  try {
    // Fetch from academic service master data endpoint
    const pool = require("../../../config/db");
    const result = await pool.query(
      `SELECT id, class_name FROM school_classes ORDER BY created_at ASC`
    );

    if (result.rows && result.rows.length > 0) {
      const classOrderMap = {};
      result.rows.forEach((cls, index) => {
        const className = cls.class_name;
        classOrderMap[cls.id] = {
          order_number: index,
          class_name: className,
        };
        // Cache the class name
        if (className) {
          classNameCache[cls.id] = className;
        }
      });
      return classOrderMap;
    }

    // Fallback to common API if database query fails
    console.warn('getAllClassesWithOrder: trying fallback common API');
    const response = await commonApiGet(`/api/v1/classes`, null);
    if (response && response.success && Array.isArray(response.data)) {
      const classOrderMap = {};
      response.data.forEach((cls, index) => {
        const className = cls.class_name || cls.name;
        classOrderMap[cls.id] = {
          order_number: cls.order_number || index,
          class_name: className,
        };
        if (className) {
          classNameCache[cls.id] = className;
        }
      });
      return classOrderMap;
    }
    return {};
  } catch (error) {
    console.warn('getAllClassesWithOrder: both local and common API failed', error.message);
    return {};
  }
};

// Helper function to fetch total class count from common API
const getTotalClassCount = async () => {
  try {
    const response = await commonApiGet(`/api/v1/classes`, null);
    if (response && response.success && Array.isArray(response.data)) {
      return response.data.length;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

// Helper to enrich assignments with class names
const enrichAssignmentsWithClassNames = async (assignments) => {
  return Promise.all(
    assignments.map(async (assignment) => {
      const className = await getClassName(assignment.class_id);
      return {
        id: assignment.id || assignment.assignment_id,  // Ensure id field is preserved
        ...assignment,
        class_name: className,
      };
    })
  );
};

// Helper function to format class display based on range
const formatClassDisplayWithRange = async (assignments, totalClassCount) => {
  if (!assignments || assignments.length === 0) return '';

  // Get unique class IDs to check for full range
  const classIds = assignments.map(a => a.class_id);
  const uniqueClassIds = [...new Set(classIds)];

  // Check if this is a full range (all classes in system)
  const isFullRange = await subjectAssignService.isFullClassRange(uniqueClassIds, totalClassCount);

  // Get unique class names and sort them by sequence (they come pre-sorted from DB)
  const classNames = [...new Set(assignments.map(a => a.class_name).filter(Boolean))];

  if (isFullRange) {
    // Get first and last class names for range display
    const firstClass = classNames[0];
    const lastClass = classNames[classNames.length - 1];
    return `${firstClass}-${lastClass}`;
  }

  // Otherwise, show individual class names separated by comma and space
  return classNames.join(', ');
};

// Helper function to format class ranges
// If all classes are assigned, show range "LKG-12th"
// Otherwise show individual classes
const formatClassDisplay = (assignments) => {
  if (!assignments || assignments.length === 0) return [];

  // Group assignments by teacher_id
  const groupedByTeacher = {};
  assignments.forEach((assignment) => {
    if (!groupedByTeacher[assignment.teacher_id]) {
      groupedByTeacher[assignment.teacher_id] = {
        teacher_id: assignment.teacher_id,
        teacher_name: assignment.teacher_name,
        classes: [],
        assignments: [],
      };
    }
    groupedByTeacher[assignment.teacher_id].classes.push(assignment.class_id);
    groupedByTeacher[assignment.teacher_id].assignments.push(assignment);
  });

  // Return formatted result
  return Object.values(groupedByTeacher).map((group) => ({
    teacher_id: group.teacher_id,
    teacher_name: group.teacher_name,
    classes: group.classes,
    class_count: group.classes.length,
    assignments: group.assignments,
  }));
};

const subjectAssignController = {
  // Create subject with batch class+section assignments
  // POST /api/v1/academic/admin/subject-assign
  // New body: { catalog_id, class_assignments: [{class_id, section_name, teacher_id}, ...] }
  // Legacy body: { subject_name, class_assignments: [{class_id, teacher_id}, ...] }
  createSubject: async (req, res, next) => {
    try {
      const { subject_name, catalog_id, class_assignments } = req.body;
      const school_id = req.user.school_id;
      const user = req.user;

      const result = await subjectAssignService.createSubjectWithAssignments(
        user,
        school_id,
        subject_name,
        class_assignments,
        catalog_id
      );

      return res.status(201).json({
        success: true,
        message: "Subject created successfully with class assignments",
        data: {
          subject: result.subject,
          assignments: result.assignments,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/academic/admin/subject-assign/:subjectId/assignments
  // Bulk replace ALL assignments for one of the school's subjects.
  // Body: { catalog_id?, assignments: [{class_id, section_name, teacher_id}] }
  bulkReplaceAssignments: async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const { catalog_id, assignments } = req.body || {};
      const school_id = req.user.school_id;

      const result = await subjectAssignService.bulkReplaceAssignments({
        user: req.user,
        school_id,
        subject_id: subjectId,
        catalog_id,
        assignments,
      });

      return res.json({
        success: true,
        message: "Subject assignments replaced",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/subject-assign/teacher/:teacherId
  getAssignmentsForTeacher: async (req, res, next) => {
    try {
      const { teacherId } = req.params;
      const school_id = req.user.school_id;

      const data = await subjectAssignService.getAssignmentsForTeacher({
        user: req.user,
        school_id,
        teacher_id: teacherId,
      });

      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // Get all subjects for a school
  // GET /api/v1/academic/admin/subject-assign
  getAllSubjects: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const subjects =
        await subjectAssignService.getAllSubjectsWithAssignments(
          user,
          school_id
        );

      // Fetch total class count once for all subjects
      const totalClassCount = await getTotalClassCount();

      return res.status(200).json({
        success: true,
        message: "Subjects retrieved successfully",
        data: await Promise.all(subjects.map(async (subject) => {
          const validAssignments = (subject.assignments && subject.assignments.filter(
            (a) => a.assignment_id !== null
          )) || [];

          // Enrich assignments with class names
          const enrichedAssignments = await enrichAssignmentsWithClassNames(validAssignments);

          // Check if this is a full class range and format display accordingly
          const classDisplay = await formatClassDisplayWithRange(enrichedAssignments, totalClassCount);

          return {
            id: subject.id,
            subject_name: subject.subject_name,
            catalog_id: subject.catalog_id,
            class_count: enrichedAssignments.length,
            class_display: classDisplay,  // "LKG-12th" or "LKG UKG 6th 7th..."
            assignments: enrichedAssignments.map((assignment) => ({
              assignment_id: assignment.id,
              class_id: assignment.class_id,
              class_name: assignment.class_name,
              section_name: assignment.section_name,
              teacher_id: assignment.teacher_id,
              teacher_name: assignment.teacher_name,
              created_at: assignment.created_at,
              updated_at: assignment.updated_at,
            })),
            created_at: subject.created_at,
            updated_at: subject.updated_at,
          };
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get subject by ID with all assignments
  // GET /api/v1/academic/admin/subject-assign/:subjectId
  getSubjectById: async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const result = await subjectAssignService.getSubjectWithAssignments(
        user,
        school_id,
        subjectId
      );

      const assignments = result.assignments || [];

      // Enrich assignments with class names
      const enrichedAssignments = await enrichAssignmentsWithClassNames(assignments);

      // Fetch total class count for range detection
      const totalClassCount = await getTotalClassCount();

      // Check if this is a full class range and format display accordingly
      const classDisplay = await formatClassDisplayWithRange(enrichedAssignments, totalClassCount);

      return res.status(200).json({
        success: true,
        message: "Subject retrieved successfully",
        data: {
          id: result.id,
          subject_name: result.subject_name,
          class_count: enrichedAssignments.length,
          class_display: classDisplay,  // "LKG-12th" or "LKG UKG 6th 7th..."
          assignments: enrichedAssignments.map((assignment) => ({
            assignment_id: assignment.id,
            class_id: assignment.class_id,
            class_name: assignment.class_name,
            teacher_id: assignment.teacher_id,
            teacher_name: assignment.teacher_name,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
          })),
          created_at: result.created_at,
          updated_at: result.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update subject name
  // PATCH /api/v1/academic/admin/subject-assign/:subjectId
  // Body: { subject_name }
  updateSubject: async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const { subject_name } = req.body;
      const school_id = req.user.school_id;
      const user = req.user;

      const updated = await subjectAssignService.updateSubject(
        user,
        school_id,
        subjectId,
        subject_name
      );

      return res.status(200).json({
        success: true,
        message: "Subject updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update assignment (change teacher)
  // PATCH /api/v1/academic/admin/subject-assign/assignment/:assignmentId
  // Body: { teacher_id }
  updateAssignment: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const { teacher_id } = req.body;
      const school_id = req.user.school_id;
      const user = req.user;

      const updated = await subjectAssignService.updateAssignment(
        user,
        school_id,
        assignmentId,
        teacher_id
      );

      return res.status(200).json({
        success: true,
        message: "Assignment updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete assignment
  // DELETE /api/v1/academic/admin/subject-assign/assignment/:assignmentId
  deleteAssignment: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const deleted = await subjectAssignService.deleteAssignment(
        user,
        school_id,
        assignmentId
      );

      return res.status(200).json({
        success: true,
        message: "Assignment deleted successfully",
        data: {
          assignment_id: deleted.id,
          subject_id: deleted.subject_id,
          class_id: deleted.class_id,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete subject (cascades to all assignments)
  // DELETE /api/v1/academic/admin/subject-assign/:subjectId
  deleteSubject: async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const deleted = await subjectAssignService.deleteSubject(
        user,
        school_id,
        subjectId
      );

      return res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
        data: {
          subject_id: deleted.id,
          subject_name: deleted.subject_name,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all subjects and teachers for a specific class
  // GET /api/v1/academic/admin/subject-assign/class/:classId
  getSubjectsAndTeachersByClass: async (req, res, next) => {
    try {
      const { classId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const results = await subjectAssignService.getSubjectsAndTeachersByClass(
        user,
        school_id,
        classId
      );

      // Group by subject and enrich with class name
      const classNameResult = await getClassName(classId);

      // Format the response - group by subject
      const subjectMap = {};
      results.forEach((row) => {
        if (!subjectMap[row.subject_id]) {
          subjectMap[row.subject_id] = {
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            teachers: [],
          };
        }
        subjectMap[row.subject_id].teachers.push({
          assignment_id: row.assignment_id,
          teacher_id: row.teacher_id,
          teacher_name: row.teacher_name,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      });

      const subjects = Object.values(subjectMap);

      return res.status(200).json({
        success: true,
        message: "Subjects and teachers retrieved successfully",
        data: {
          class_id: classId,
          class_name: classNameResult,
          total_subjects: subjects.length,
          subjects: subjects,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all classes with their subjects and teachers
  // GET /api/v1/academic/admin/subject-assign/classes/full-list
  getAllClassesWithSubjectsAndTeachers: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const results = await subjectAssignService.getAllClassesWithSubjectsAndTeachers(
        user,
        school_id
      );

      // Fetch all class names and order information
      const classOrderMap = await getAllClassesWithOrder();

      // Group by class, then by subject
      const classMap = {};
      results.forEach((row) => {
        if (!classMap[row.class_id]) {
          classMap[row.class_id] = {
            class_id: row.class_id,
            class_name: (classOrderMap[row.class_id] && classOrderMap[row.class_id].class_name) || row.class_id,
            order_number: (classOrderMap[row.class_id] && classOrderMap[row.class_id].order_number) || 999,
            subjects: {},
          };
        }

        if (!classMap[row.class_id].subjects[row.subject_id]) {
          classMap[row.class_id].subjects[row.subject_id] = {
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            teachers: [],
          };
        }

        classMap[row.class_id].subjects[row.subject_id].teachers.push({
          assignment_id: row.assignment_id,
          teacher_id: row.teacher_id,
          teacher_name: row.teacher_name,
          section_name: row.section_name,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      });

      // Convert subjects map to array for each class, then sort by order_number
      let classes = Object.values(classMap).map(classItem => {
        // Use the class_name from classOrderMap (which has actual names like "LKG", "Class 2", etc.)
        // If not found, try cache, if still not found use fallback format
        let displayName = classItem.class_name;

        if (displayName === classItem.class_id) {
          // Class name is UUID, try cache
          const cachedName = classNameCache[classItem.class_id];
          if (cachedName) {
            displayName = cachedName;
          } else {
            // Last resort fallback
            displayName = `Class ${classItem.class_id.substring(0, 8).toUpperCase()}`;
          }
        }

        return {
          class_id: classItem.class_id,
          class_name: displayName,
          total_subjects: Object.keys(classItem.subjects).length,
          subjects: Object.values(classItem.subjects),
        };
      });

      // Sort classes by order_number from common-api
      classes = classes.sort((a, b) => {
        const orderA = (classOrderMap[a.class_id] && classOrderMap[a.class_id].order_number) || 999;
        const orderB = (classOrderMap[b.class_id] && classOrderMap[b.class_id].order_number) || 999;
        return orderA - orderB;
      });

      return res.status(200).json({
        success: true,
        message: "All classes with subjects and teachers retrieved successfully",
        data: {
          total_classes: classes.length,
          classes: classes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update teacher for a subject in a specific class
  // PATCH /api/v1/academic/admin/subject-assign/class/:classId/subject/:subjectId
  // Body: { teacher_id }
  updateTeacherByClassAndSubject: async (req, res, next) => {
    try {
      const { classId, subjectId } = req.params;
      const { teacher_id } = req.body;
      const school_id = req.user.school_id;
      const user = req.user;

      const updated = await subjectAssignService.updateTeacherByClassAndSubject(
        user,
        school_id,
        classId,
        subjectId,
        teacher_id
      );

      // Fetch updated teacher name
      const teacherName = await getClassName(teacher_id) || null;

      return res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: {
          assignment_id: updated.id,
          class_id: updated.class_id,
          subject_id: updated.subject_id,
          teacher_id: updated.teacher_id,
          created_at: updated.created_at,
          updated_at: updated.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = subjectAssignController;
