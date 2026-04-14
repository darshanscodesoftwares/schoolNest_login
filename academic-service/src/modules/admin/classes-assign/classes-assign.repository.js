const pool = require("../../../config/db");

const classesAssignRepository = {
  // Create a single class assignment
  createAssignment: async ({ school_id, class_id, teacher_id, section_name }) => {
    const query = {
      text: `INSERT INTO classes_assign (school_id, class_id, teacher_id, section_name)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      values: [school_id, class_id, teacher_id, section_name],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Create multiple assignments in batch (for assigning multiple sections at once)
  createBatchAssignments: async (assignments) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const results = [];
      for (const { school_id, class_id, teacher_id, section_name } of assignments) {
        const query = {
          text: `INSERT INTO classes_assign (school_id, class_id, teacher_id, section_name)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
          values: [school_id, class_id, teacher_id, section_name],
        };
        const result = await client.query(query);
        results.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all assignments for a school
  getAllAssignments: async (school_id) => {
    const query = {
      text: `SELECT ca.id, ca.school_id, ca.class_id, ca.teacher_id, ca.section_name, ca.created_at, ca.updated_at
             FROM classes_assign ca
             WHERE ca.school_id = $1
             ORDER BY ca.created_at DESC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get assignments for a specific class
  getAssignmentsByClass: async (school_id, class_id) => {
    const query = {
      text: `SELECT ca.*,
             tr.first_name as teacher_name,
             NULL as class_name,
             s.id as section_id
             FROM classes_assign ca
             LEFT JOIN teacher_records tr ON ca.teacher_id = tr.auth_user_id AND ca.school_id = tr.school_id
             LEFT JOIN sections s ON ca.section_name = s.section_name AND ca.school_id = s.school_id
             WHERE ca.school_id = $1 AND ca.class_id = $2
             ORDER BY ca.section_name`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get assignment by ID
  getAssignmentById: async (school_id, assignment_id) => {
    const query = {
      text: `SELECT ca.*,
             tr.first_name as teacher_name,
             NULL as class_name,
             s.id as section_id
             FROM classes_assign ca
             LEFT JOIN teacher_records tr ON ca.teacher_id = tr.auth_user_id AND ca.school_id = tr.school_id
             LEFT JOIN sections s ON ca.section_name = s.section_name AND ca.school_id = s.school_id
             WHERE ca.school_id = $1 AND ca.id = $2`,
      values: [school_id, assignment_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Update assignment
  updateAssignment: async ({ school_id, assignment_id, teacher_id, section_name }) => {
    const query = {
      text: `UPDATE classes_assign
             SET teacher_id = $1, section_name = $2, updated_at = NOW()
             WHERE school_id = $3 AND id = $4
             RETURNING *`,
      values: [teacher_id, section_name, school_id, assignment_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete assignment
  deleteAssignment: async (school_id, assignment_id) => {
    const query = {
      text: `DELETE FROM classes_assign
             WHERE school_id = $1 AND id = $2
             RETURNING *`,
      values: [school_id, assignment_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Check if teacher is already assigned to this class-section
  checkAssignmentExists: async (school_id, class_id, section_name) => {
    const query = {
      text: `SELECT id FROM classes_assign
             WHERE school_id = $1 AND class_id = $2 AND section_name = $3`,
      values: [school_id, class_id, section_name],
    };
    const result = await pool.query(query);
    return result.rows.length > 0;
  },

  // Delete all assignments for a class
  deleteClassAssignments: async (school_id, class_id) => {
    const query = {
      text: `DELETE FROM classes_assign
             WHERE school_id = $1 AND class_id = $2`,
      values: [school_id, class_id],
    };
    await pool.query(query);
  },

  // Get student count for a class (count all approved students in the class)
  getStudentCountByClass: async (school_id, class_id) => {
    const query = {
      text: `SELECT COUNT(*) as student_count
             FROM (
               SELECT DISTINCT ON (sa.id) sa.id
               FROM students_admission sa
               INNER JOIN academic_information ai ON sa.id = ai.student_id
               WHERE sa.school_id = $1
                 AND ai.class_id = $2
                 AND sa.admission_status = 'Approved'
               ORDER BY sa.id, ai.updated_at DESC NULLS LAST
             ) latest_students`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return parseInt(result.rows[0].student_count, 10);
  },

  // Get student count for a specific class and section
  getStudentCountByClassAndSection: async (school_id, class_id, section_name) => {
    const query = {
      text: `SELECT COUNT(*) as student_count
             FROM (
               SELECT DISTINCT ON (sa.id) sa.id
               FROM students_admission sa
               INNER JOIN academic_information ai ON sa.id = ai.student_id
               WHERE sa.school_id = $1
                 AND ai.class_id = $2
                 AND ai.section = $3
                 AND sa.admission_status = 'Approved'
               ORDER BY sa.id, ai.updated_at DESC NULLS LAST
             ) latest_students`,
      values: [school_id, class_id, section_name],
    };
    const result = await pool.query(query);
    return parseInt(result.rows[0].student_count, 10);
  },

  // Get all active teachers for a school
  getTeachersList: async (school_id) => {
    const query = {
      text: `SELECT id AS teacher_id,
             first_name,
             designation,
             employment_status
             FROM teacher_records
             WHERE school_id = $1 AND employment_status = 'Active'
             ORDER BY first_name ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all parents for a school with their student information
  getParentsList: async (school_id) => {
    const query = {
      text: `SELECT DISTINCT
             pgi.id,
             COALESCE(pgi.father_full_name, pgi.mother_full_name, pgi.guardian_full_name) as parent_full_name,
             STRING_AGG(DISTINCT CONCAT(pi.first_name, ' ', pi.last_name), ', ') as student_names,
             STRING_AGG(DISTINCT CONCAT(ai.class_id, '|', ai.section), ', ') as class_info_raw
             FROM parent_guardian_information pgi
             LEFT JOIN students_admission sa ON pgi.student_id = sa.id
             LEFT JOIN personal_information pi ON sa.id = pi.student_id
             LEFT JOIN academic_information ai ON sa.id = ai.student_id
             WHERE pgi.school_id = $1
             GROUP BY pgi.id, pgi.father_full_name, pgi.mother_full_name, pgi.guardian_full_name
             ORDER BY COALESCE(pgi.father_full_name, pgi.mother_full_name, pgi.guardian_full_name) ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all unique sections from classes_assign with section_id (NULL if not in sections table)
  getAllSections: async (school_id) => {
    const query = {
      text: `SELECT DISTINCT ca.section_name,
             s.id as section_id
             FROM classes_assign ca
             LEFT JOIN sections s ON ca.section_name = s.section_name AND ca.school_id = s.school_id
             WHERE ca.school_id = $1
             ORDER BY ca.section_name ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all unique classes from classes_assign
  getAllClasses: async (school_id) => {
    const query = {
      text: `SELECT DISTINCT class_id
             FROM classes_assign
             WHERE school_id = $1
             ORDER BY class_id ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },
};

module.exports = classesAssignRepository;
