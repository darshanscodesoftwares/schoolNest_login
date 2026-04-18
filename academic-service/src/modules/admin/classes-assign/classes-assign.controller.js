const classesAssignService = require("./classes-assign.service");
const { commonApiGet } = require("../../../utils/common-api.client");

// Helper function to fetch class name from common API
const getClassName = async (classId) => {
  try {
    const response = await commonApiGet(`/api/v1/classes/${classId}`, null);
    if (response && response.success && response.data) {
      return response.data.class_name || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Helper to get teacher name from database
const getTeacherName = async (school_id, teacher_id) => {
  try {
    const pool = require("../../../config/db");
    const result = await pool.query(
      `SELECT first_name FROM teacher_records WHERE school_id = $1 AND auth_user_id = $2 LIMIT 1`,
      [school_id, teacher_id]
    );
    return (result.rows[0] && result.rows[0].first_name) || null;
  } catch (error) {
    return null;
  }
};

// Helper to enrich assignments with class names and teacher names
const enrichAssignments = async (assignments, school_id) => {
  return Promise.all(
    assignments.map(async (assignment) => {
      const className = await getClassName(assignment.class_id);
      const teacherName = await getTeacherName(school_id, assignment.teacher_id);
      return {
        ...assignment,
        class_name: className,
        teacher_name: teacherName || assignment.teacher_name,
      };
    })
  );
};

const classesAssignController = {
  // Create batch assignments for a class
  // POST /api/v1/academic/admin/classes-assign
  // Body: { class_id, assignments: [{section_name, teacher_id}, ...] }
  // school_id extracted from JWT token
  createAssignments: async (req, res, next) => {
    try {
      const { class_id, assignments } = req.body;
      const school_id = req.user.school_id;
      const user = req.user;

      const results = await classesAssignService.createAssignments(
        user,
        school_id,
        class_id,
        assignments
      );
      const enrichedAssignments = await enrichAssignments(results, school_id);

      return res.status(201).json({
        success: true,
        message: "Class assignments created successfully",
        data: enrichedAssignments.map((assignment) => ({
          id: assignment.id,
          school_id: assignment.school_id,
          class_name: assignment.class_name,
          section_name: assignment.section_name,
          teacher_name: assignment.teacher_name,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all assignments for a school
  // GET /api/v1/academic/admin/classes-assign
  // school_id extracted from JWT token
  getAllAssignments: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const assignments = await classesAssignService.getAllAssignments(user, school_id);
      const enrichedAssignments = await enrichAssignments(assignments, school_id);

      // Get unique class IDs and fetch student counts
      const classIds = [...new Set(enrichedAssignments.map((a) => a.class_id))];
      const studentCountMap = {};

      for (const classId of classIds) {
        const count = await classesAssignService.getStudentCountByClass(
          user,
          school_id,
          classId
        );
        studentCountMap[classId] = count;
      }

      return res.status(200).json({
        success: true,
        message: "Assignments retrieved successfully",
        data: enrichedAssignments.map((assignment) => ({
          id: assignment.id,
          school_id: assignment.school_id,
          class_name: assignment.class_name,
          section_name: assignment.section_name,
          teacher_id: assignment.teacher_id,
          teacher_name: assignment.teacher_name,
          student_count: studentCountMap[assignment.class_id] || 0,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get assignments for a specific class
  // GET /api/v1/academic/admin/classes-assign/by-class?class_id=uuid
  // school_id extracted from JWT token
  getAssignmentsByClass: async (req, res, next) => {
    try {
      const { class_id } = req.query;
      const school_id = req.user.school_id;
      const user = req.user;

      if (!class_id) {
        return res.status(400).json({
          success: false,
          message: "Missing required query parameter: class_id",
          code: "MISSING_PARAM",
        });
      }

      const assignments = await classesAssignService.getAssignmentsByClass(
        user,
        school_id,
        class_id
      );
      const enrichedAssignments = await enrichAssignments(assignments, school_id);

      // Get student count for this class
      const studentCount = await classesAssignService.getStudentCountByClass(
        user,
        school_id,
        class_id
      );

      return res.status(200).json({
        success: true,
        message: "Class assignments retrieved successfully",
        data: enrichedAssignments.map((assignment) => ({
          id: assignment.id,
          school_id: assignment.school_id,
          class_name: assignment.class_name,
          section_name: assignment.section_name,
          teacher_name: assignment.teacher_name,
          student_count: studentCount,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single assignment by ID
  // GET /api/v1/academic/admin/classes-assign/:assignmentId
  // school_id extracted from JWT token
  getAssignmentById: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const assignment = await classesAssignService.getAssignmentById(
        user,
        school_id,
        assignmentId
      );
      const enrichedAssignments = await enrichAssignments([assignment], school_id);
      const enrichedAssignment = enrichedAssignments[0];

      return res.status(200).json({
        success: true,
        message: "Assignment retrieved successfully",
        data: {
          id: enrichedAssignment.id,
          school_id: enrichedAssignment.school_id,
          class_name: enrichedAssignment.class_name,
          section_name: enrichedAssignment.section_name,
          teacher_name: enrichedAssignment.teacher_name,
          created_at: enrichedAssignment.created_at,
          updated_at: enrichedAssignment.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update assignment (change teacher or section)
  // PATCH /api/v1/academic/admin/classes-assign/:assignmentId
  // Body: { teacher_id?, section_name? }
  // school_id extracted from JWT token
  updateAssignment: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const { teacher_id, section_name } = req.body;
      const school_id = req.user.school_id;
      const user = req.user;

      const updated = await classesAssignService.updateAssignment(
        user,
        school_id,
        assignmentId,
        teacher_id,
        section_name
      );
      const enrichedAssignments = await enrichAssignments([updated], school_id);
      const enrichedAssignment = enrichedAssignments[0];

      return res.status(200).json({
        success: true,
        message: "Assignment updated successfully",
        data: {
          id: enrichedAssignment.id,
          school_id: enrichedAssignment.school_id,
          class_name: enrichedAssignment.class_name,
          section_name: enrichedAssignment.section_name,
          teacher_name: enrichedAssignment.teacher_name,
          created_at: enrichedAssignment.created_at,
          updated_at: enrichedAssignment.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete assignment
  // DELETE /api/v1/academic/admin/classes-assign/:assignmentId
  // school_id extracted from JWT token
  deleteAssignment: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const deleted = await classesAssignService.deleteAssignment(
        user,
        school_id,
        assignmentId
      );

      return res.status(200).json({
        success: true,
        message: "Assignment deleted successfully",
        data: {
          id: deleted.id,
          section_name: deleted.section_name,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all active teachers list for a school
  // GET /api/v1/academic/admin/teachers-list
  // school_id extracted from JWT token
  getTeachersList: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const teachers = await classesAssignService.getTeachersList(user, school_id);

      return res.status(200).json({
        success: true,
        message: "Teachers list retrieved successfully",
        data: teachers.map((teacher) => ({
          teacher_id: teacher.teacher_id,
          first_name: teacher.first_name,
          designation: teacher.designation,
          employment_status: teacher.employment_status,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all parents list for a school
  // Updated: Now supports optional filtering by classId and section
  // GET /api/v1/academic/admin/parents-list?classId=uuid&section=A
  // school_id extracted from JWT token
  getParentsList: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { classId, section } = req.query;

      // Build filters object only with provided parameters
      const filters = {};
      if (classId) filters.classId = classId;
      if (section) filters.section = section;

      const parents = await classesAssignService.getParentsList(user, school_id, filters);

      // Enrich class_info with actual class names from API
      const enrichedParents = await Promise.all(
        parents.map(async (parent) => {
          let classInfo = '';

          // Parse class_info_raw (format: "uuid|A, uuid|B, ...")
          if (parent.class_info_raw) {
            const classEntries = parent.class_info_raw.split(', ');
            const enrichedClassInfo = await Promise.all(
              classEntries.map(async (entry) => {
                const [classId, section] = entry.split('|');

                if (!classId || !section) return null;

                try {
                  // Fetch class name from common API
                  const response = await commonApiGet(`/api/v1/classes/${classId}`, null);
                  if (response && response.success && response.data && response.data.class_name) {
                    return `${response.data.class_name}-${section}`;
                  }
                } catch (error) {
                  // Silently handle API errors
                }

                // Fallback: return just the section if class name fetch fails
                return `-${section}`;
              })
            );

            classInfo = enrichedClassInfo.filter(c => c !== null).join(', ');
          }

          return {
            parent_id: parent.id,
            parent_full_name: parent.parent_full_name,
            student_names: parent.student_names,
            class_info: classInfo,
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Parents list retrieved successfully",
        data: enrichedParents,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/classes-assign/sections
  // Get all unique sections
  getAllSections: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const sections = await classesAssignService.getAllSections(user, school_id);

      return res.status(200).json({
        success: true,
        message: "Sections retrieved successfully",
        data: sections,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/classes-assign/class
  // Get all unique classes
  getAllClasses: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const classIds = await classesAssignService.getAllClasses(user, school_id);

      // Enrich with class names from common API
      const enrichedClasses = await Promise.all(
        classIds.map(async (item) => {
          const className = await getClassName(item.class_id);
          return {
            class_id: item.class_id,
            class_name: className,
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Classes retrieved successfully",
        data: enrichedClasses,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = classesAssignController;
