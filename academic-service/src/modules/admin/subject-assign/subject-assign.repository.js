const pool = require("../../../config/db");

// Helper to get all classes in the system (for range detection)
const getAllClassesForSchool = async (school_id) => {
  try {
    const query = {
      text: `SELECT DISTINCT id FROM classes ORDER BY id LIMIT 100`,
    };
    const result = await pool.query(query);
    return result.rows.map(row => row.id);
  } catch (error) {
    return [];
  }
};

const subjectAssignRepository = {
  // Create a subject
  createSubject: async ({ school_id, subject_name }) => {
    const query = {
      text: `INSERT INTO subjects (school_id, subject_name)
             VALUES ($1, $2)
             RETURNING *`,
      values: [school_id, subject_name],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Create batch subject-class assignments
  createBatchSubjectClassAssign: async (assignments) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const results = [];
      assignments.forEach(({ school_id, subject_id, class_id, teacher_id, sequence }, index) => {
        // Use provided sequence or fallback to index
        const seq = sequence !== undefined ? sequence : index + 1;
        results.push(
          client.query(
            `INSERT INTO subject_class_assign (school_id, subject_id, class_id, teacher_id, sequence)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [school_id, subject_id, class_id, teacher_id, seq]
          )
        );
      });

      const queryResults = await Promise.all(results);
      const insertedRows = queryResults.map(result => result.rows[0]);

      await client.query("COMMIT");
      return insertedRows;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all subjects for a school
  getAllSubjects: async (school_id) => {
    const query = {
      text: `SELECT s.id,
             s.subject_name,
             COUNT(sca.id) as class_count,
             s.created_at,
             s.updated_at
             FROM subjects s
             LEFT JOIN subject_class_assign sca ON s.id = sca.subject_id
             WHERE s.school_id = $1
             GROUP BY s.id
             ORDER BY s.created_at DESC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get subject by ID with all class assignments
  getSubjectById: async (school_id, subject_id) => {
    const query = {
      text: `SELECT s.id,
             s.subject_name,
             s.created_at,
             s.updated_at
             FROM subjects s
             WHERE s.school_id = $1 AND s.id = $2`,
      values: [school_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get all class assignments for a subject
  getSubjectClassAssignments: async (school_id, subject_id) => {
    const query = {
      text: `SELECT sca.id,
             sca.subject_id,
             sca.class_id,
             sca.teacher_id,
             tr.first_name as teacher_name,
             sca.created_at,
             sca.updated_at
             FROM subject_class_assign sca
             LEFT JOIN teacher_records tr ON sca.teacher_id IS NOT NULL AND sca.teacher_id::UUID = tr.id
             WHERE sca.school_id = $1 AND sca.subject_id = $2
             ORDER BY sca.created_at DESC`,
      values: [school_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Check if assignment already exists
  checkAssignmentExists: async (school_id, subject_id, class_id) => {
    const query = {
      text: `SELECT id FROM subject_class_assign
             WHERE school_id = $1 AND subject_id = $2 AND class_id = $3`,
      values: [school_id, subject_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows.length > 0;
  },

  // Update subject name
  updateSubject: async (school_id, subject_id, subject_name) => {
    const query = {
      text: `UPDATE subjects
             SET subject_name = $1, updated_at = NOW()
             WHERE school_id = $2 AND id = $3
             RETURNING *`,
      values: [subject_name, school_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Update subject-class assignment (change teacher)
  updateSubjectClassAssign: async (school_id, assignment_id, teacher_id) => {
    const query = {
      text: `UPDATE subject_class_assign
             SET teacher_id = $1, updated_at = NOW()
             WHERE school_id = $2 AND id = $3
             RETURNING *`,
      values: [teacher_id, school_id, assignment_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete subject-class assignment
  deleteSubjectClassAssign: async (school_id, assignment_id) => {
    const query = {
      text: `DELETE FROM subject_class_assign
             WHERE school_id = $1 AND id = $2
             RETURNING *`,
      values: [school_id, assignment_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete all assignments for a subject
  deleteSubjectAssignments: async (school_id, subject_id) => {
    const query = {
      text: `DELETE FROM subject_class_assign
             WHERE school_id = $1 AND subject_id = $2`,
      values: [school_id, subject_id],
    };
    await pool.query(query);
  },

  // Delete subject
  deleteSubject: async (school_id, subject_id) => {
    const query = {
      text: `DELETE FROM subjects
             WHERE school_id = $1 AND id = $2
             RETURNING *`,
      values: [school_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get all subjects and their class assignments
  getAllSubjectsWithAssignments: async (school_id) => {
    const query = {
      text: `SELECT s.id,
             s.subject_name,
             json_agg(json_build_object(
               'assignment_id', sca.id,
               'class_id', sca.class_id,
               'teacher_id', sca.teacher_id,
               'teacher_name', tr.first_name,
               'created_at', sca.created_at,
               'updated_at', sca.updated_at
             ) ORDER BY sca.sequence ASC) as assignments,
             s.created_at,
             s.updated_at
             FROM subjects s
             LEFT JOIN subject_class_assign sca ON s.id = sca.subject_id
             LEFT JOIN teacher_records tr ON sca.teacher_id IS NOT NULL AND sca.teacher_id::UUID = tr.id
             WHERE s.school_id = $1
             GROUP BY s.id
             ORDER BY s.created_at DESC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Check if assigned class IDs match all available classes (full range)
  // Simply compares count - the actual class list fetch happens in the service/controller
  isFullClassRange: async (assignedClassIds, totalClassCount) => {
    try {
      if (!assignedClassIds || assignedClassIds.length === 0) return false;

      // Get unique class IDs (in case there are duplicates)
      const uniqueClassIds = [...new Set(assignedClassIds)];

      // Compare with total classes in system
      return uniqueClassIds.length === totalClassCount;
    } catch (error) {
      return false;
    }
  },

  // Get all subjects and teachers for a specific class
  getSubjectsAndTeachersByClass: async (school_id, class_id) => {
    const query = {
      text: `SELECT s.id as subject_id,
             s.subject_name,
             sca.id as assignment_id,
             sca.teacher_id,
             tr.first_name as teacher_name,
             sca.created_at,
             sca.updated_at
             FROM subjects s
             INNER JOIN subject_class_assign sca ON s.id = sca.subject_id
             LEFT JOIN teacher_records tr ON sca.teacher_id IS NOT NULL AND sca.teacher_id::UUID = tr.id
             WHERE s.school_id = $1 AND sca.class_id = $2
             ORDER BY s.created_at DESC`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all classes with their subjects and teachers
  // Note: Ordering by class_id will be done in the controller after enriching with class names
  // since class order information comes from the common-api
  getAllClassesWithSubjectsAndTeachers: async (school_id) => {
    const query = {
      text: `SELECT sca.class_id,
             s.id as subject_id,
             s.subject_name,
             sca.id as assignment_id,
             sca.teacher_id,
             sca.sequence,
             tr.first_name as teacher_name,
             sca.created_at,
             sca.updated_at
             FROM subjects s
             INNER JOIN subject_class_assign sca ON s.id = sca.subject_id
             LEFT JOIN teacher_records tr ON sca.teacher_id IS NOT NULL AND sca.teacher_id::UUID = tr.id
             WHERE s.school_id = $1
             ORDER BY sca.class_id, sca.sequence ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Update teacher for a subject-class assignment by class_id and subject_id
  updateTeacherByClassAndSubject: async (school_id, class_id, subject_id, teacher_id) => {
    const query = {
      text: `UPDATE subject_class_assign
             SET teacher_id = $1, updated_at = NOW()
             WHERE school_id = $2 AND class_id = $3 AND subject_id = $4
             RETURNING *`,
      values: [teacher_id, school_id, class_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get assignment by class_id and subject_id
  getAssignmentByClassAndSubject: async (school_id, class_id, subject_id) => {
    const query = {
      text: `SELECT *
             FROM subject_class_assign
             WHERE school_id = $1 AND class_id = $2 AND subject_id = $3`,
      values: [school_id, class_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },
};

module.exports = subjectAssignRepository;
