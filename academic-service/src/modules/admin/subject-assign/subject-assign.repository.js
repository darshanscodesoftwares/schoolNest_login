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
  // Create a subject (legacy free-text path — kept for back-compat).
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

  // Import a catalog subject into this school. Idempotent — returns the existing
  // subjects row if one already references this catalog entry for this school.
  importFromCatalog: async ({ school_id, catalog_id }) => {
    const existing = await pool.query(
      `SELECT s.id, s.school_id, s.subject_name, s.catalog_id, s.created_at, s.updated_at
       FROM subjects s WHERE s.school_id = $1 AND s.catalog_id = $2::uuid LIMIT 1`,
      [school_id, catalog_id]
    );
    if (existing.rows[0]) return existing.rows[0];

    const cat = await pool.query(
      `SELECT subject_name FROM subject_catalog WHERE id = $1::uuid AND is_active = TRUE`,
      [catalog_id]
    );
    if (!cat.rows[0]) {
      const err = new Error('Invalid or inactive catalog subject');
      err.statusCode = 400;
      throw err;
    }

    const inserted = await pool.query(
      `INSERT INTO subjects (school_id, subject_name, catalog_id)
       VALUES ($1, $2, $3::uuid)
       ON CONFLICT (school_id, subject_name) DO UPDATE SET catalog_id = EXCLUDED.catalog_id
       RETURNING *`,
      [school_id, cat.rows[0].subject_name, catalog_id]
    );
    return inserted.rows[0];
  },

  // Create batch subject-class-section assignments. Each assignment carries
  // section_name now; uniqueness is per (school, subject, class, section).
  createBatchSubjectClassAssign: async (assignments) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const results = [];
      for (const { school_id, subject_id, class_id, section_name, teacher_id, sequence } of assignments) {
        const existing = await client.query(
          `SELECT id FROM subject_class_assign
           WHERE school_id = $1
             AND subject_id = $2::uuid
             AND class_id = $3::uuid
             AND section_name IS NOT DISTINCT FROM $4
           LIMIT 1`,
          [school_id, subject_id, class_id, section_name || null]
        );

        if (existing.rows && existing.rows.length > 0) {
          continue;
        }

        const seq = sequence !== undefined ? sequence : 1;
        const result = await client.query(
          `INSERT INTO subject_class_assign (school_id, subject_id, class_id, section_name, teacher_id, sequence)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [school_id, subject_id, class_id, section_name || null, teacher_id, seq]
        );

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

  // Bulk replace ALL assignments for a school's subject in one transaction.
  // Server diffs current vs. incoming; inserts new, updates teacher on existing,
  // deletes any that were dropped. Used by the EDIT modal's Save.
  bulkReplaceAssignments: async ({ school_id, subject_id, assignments }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const incomingKeys = new Set(
        assignments.map((a) => `${a.class_id}|${a.section_name || ''}`)
      );

      // Delete rows whose (class, section) is not in the new list
      const current = await client.query(
        `SELECT id, class_id, section_name FROM subject_class_assign
         WHERE school_id = $1 AND subject_id = $2::uuid`,
        [school_id, subject_id]
      );
      for (const row of current.rows) {
        const key = `${row.class_id}|${row.section_name || ''}`;
        if (!incomingKeys.has(key)) {
          await client.query(
            `DELETE FROM subject_class_assign WHERE id = $1::uuid`,
            [row.id]
          );
        }
      }

      // Upsert each incoming assignment
      const upserted = [];
      for (const a of assignments) {
        const existing = await client.query(
          `SELECT id FROM subject_class_assign
           WHERE school_id = $1 AND subject_id = $2::uuid
             AND class_id = $3::uuid AND section_name IS NOT DISTINCT FROM $4
           LIMIT 1`,
          [school_id, subject_id, a.class_id, a.section_name || null]
        );

        if (existing.rows[0]) {
          const updated = await client.query(
            `UPDATE subject_class_assign
             SET teacher_id = $1, updated_at = NOW()
             WHERE id = $2::uuid
             RETURNING *`,
            [a.teacher_id, existing.rows[0].id]
          );
          upserted.push(updated.rows[0]);
        } else {
          const inserted = await client.query(
            `INSERT INTO subject_class_assign (school_id, subject_id, class_id, section_name, teacher_id, sequence)
             VALUES ($1, $2::uuid, $3::uuid, $4, $5, COALESCE($6, 0))
             RETURNING *`,
            [school_id, subject_id, a.class_id, a.section_name || null, a.teacher_id, a.sequence]
          );
          upserted.push(inserted.rows[0]);
        }
      }

      await client.query('COMMIT');
      return upserted;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // List all subject-class-section assignments for a teacher across the school.
  // Returns one row per (subject, class, section) the teacher is assigned to.
  getAssignmentsForTeacher: async ({ school_id, teacher_id }) => {
    const { rows } = await pool.query(
      `SELECT sca.id AS assignment_id,
              s.id AS subject_id,
              s.subject_name,
              sca.class_id,
              psc.class_name,
              sca.section_name,
              sca.created_at
       FROM subject_class_assign sca
       JOIN subjects s ON s.id = sca.subject_id
       LEFT JOIN school_classes psc ON psc.id = sca.class_id
       WHERE sca.school_id = $1 AND sca.teacher_id = $2
       ORDER BY psc.class_name, sca.section_name, s.subject_name`,
      [school_id, teacher_id]
    );
    return rows;
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
             WHERE s.school_id = $1 AND s.id = $2::uuid`,
      values: [school_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get subject by name for a school
  getSubjectByName: async ({ school_id, subject_name }) => {
    const query = {
      text: `SELECT s.id,
             s.subject_name,
             s.created_at,
             s.updated_at
             FROM subjects s
             WHERE s.school_id = $1 AND s.subject_name = $2`,
      values: [school_id, subject_name],
    };
    const result = await pool.query(query);
    return result.rows[0] || null;
  },

  // Get all class assignments for a subject
  getSubjectClassAssignments: async (school_id, subject_id) => {
    const query = {
      text: `SELECT sca.id,
             sca.subject_id,
             sca.class_id,
             sca.section_name,
             sca.teacher_id,
             tr.first_name as teacher_name,
             sca.created_at,
             sca.updated_at
             FROM subject_class_assign sca
             LEFT JOIN teacher_records tr ON (sca.teacher_id = tr.auth_user_id OR sca.teacher_id = tr.id::text)
             WHERE sca.school_id = $1 AND sca.subject_id = $2::uuid
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
             WHERE school_id = $1 AND subject_id = $2::uuid AND class_id = $3::uuid`,
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
             WHERE school_id = $2 AND id = $3::uuid
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
             WHERE school_id = $2 AND id = $3::uuid
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
             WHERE school_id = $1 AND id = $2::uuid
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
             WHERE school_id = $1 AND subject_id = $2::uuid`,
      values: [school_id, subject_id],
    };
    await pool.query(query);
  },

  // Delete subject (with cascade delete for dependent records)
  deleteSubject: async (school_id, subject_id) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // First delete all exam details that reference this subject
      await client.query(
        `DELETE FROM exam_details WHERE subject_id = $1::uuid`,
        [subject_id]
      );

      // Then delete all subject-class assignments
      await client.query(
        `DELETE FROM subject_class_assign WHERE subject_id = $1::uuid AND school_id = $2`,
        [subject_id, school_id]
      );

      // Finally delete the subject
      const query = {
        text: `DELETE FROM subjects
               WHERE school_id = $1 AND id = $2::uuid
               RETURNING *`,
        values: [school_id, subject_id],
      };
      const result = await client.query(query);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all subjects and their class assignments (now per-section)
  getAllSubjectsWithAssignments: async (school_id) => {
    const query = {
      text: `SELECT s.id,
             s.subject_name,
             s.catalog_id,
             json_agg(json_build_object(
               'assignment_id', sca.id,
               'class_id', sca.class_id,
               'section_name', sca.section_name,
               'teacher_id', sca.teacher_id,
               'teacher_name', tr.first_name,
               'created_at', sca.created_at,
               'updated_at', sca.updated_at
             ) ORDER BY sca.sequence ASC) FILTER (WHERE sca.id IS NOT NULL) as assignments,
             s.created_at,
             s.updated_at
             FROM subjects s
             LEFT JOIN subject_class_assign sca ON s.id = sca.subject_id
             LEFT JOIN teacher_records tr ON (sca.teacher_id = tr.auth_user_id OR sca.teacher_id = tr.id::text)
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
             LEFT JOIN teacher_records tr ON (sca.teacher_id = tr.auth_user_id OR sca.teacher_id = tr.id::text)
             WHERE s.school_id = $1 AND sca.class_id = $2::uuid
             ORDER BY s.created_at DESC`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all classes with their subjects and teachers (per-section)
  getAllClassesWithSubjectsAndTeachers: async (school_id) => {
    const query = {
      text: `SELECT sca.class_id,
             sca.section_name,
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
             LEFT JOIN teacher_records tr ON (sca.teacher_id = tr.auth_user_id OR sca.teacher_id = tr.id::text)
             WHERE s.school_id = $1
             ORDER BY sca.class_id, sca.section_name, sca.sequence ASC`,
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
             WHERE school_id = $2 AND class_id = $3::uuid AND subject_id = $4::uuid
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
             WHERE school_id = $1 AND class_id = $2::uuid AND subject_id = $3::uuid`,
      values: [school_id, class_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },
};

module.exports = subjectAssignRepository;
