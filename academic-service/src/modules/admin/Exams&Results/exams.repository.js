const pool = require("../../../config/db");

// Helper function to fetch exam details
const getExamDetailsForId = async (school_id, exam_id) => {
  const detailsQuery = {
    text: `SELECT ed.*, s.subject_name, sec.section_name
           FROM exam_details ed
           LEFT JOIN subjects s ON ed.subject_id = s.id
           LEFT JOIN sections sec ON ed.section_id = sec.id
           WHERE ed.exam_id = $1 AND ed.school_id = $2
           ORDER BY ed.created_at ASC`,
    values: [exam_id, school_id],
  };
  const details = await pool.query(detailsQuery);
  return details.rows;
};

const examsRepository = {
  // Get or create subject by name
  getOrCreateSubject: async (school_id, subject_name) => {
    // Only find existing subject - do NOT auto-create
    const findQuery = {
      text: `SELECT id FROM subjects WHERE school_id = $1 AND LOWER(subject_name) = LOWER($2) LIMIT 1`,
      values: [school_id, subject_name],
    };
    const findResult = await pool.query(findQuery);

    if (findResult.rows.length > 0) {
      return findResult.rows[0].id;
    }

    // If not found, throw error instead of auto-creating
    // Auto-creating caused duplicate subjects to appear in subject-assign list
    // const createQuery = {
    //   text: `INSERT INTO subjects (school_id, subject_name) VALUES ($1, $2) RETURNING id`,
    //   values: [school_id, subject_name],
    // };
    // const createResult = await pool.query(createQuery);
    // return createResult.rows[0].id;
    const error = new Error(`Subject "${subject_name}" not found. Please create it first from Subject Management.`);
    error.statusCode = 400;
    throw error;
  },


  // Create a new exam
  createExam: async (school_id, examData) => {
    const { exam_name, academic_year, start_date, end_date } = examData;
    // Determine initial status based on dates
    const today = new Date().toISOString().split('T')[0];
    let initialStatus = 'UPCOMING';
    if (new Date(start_date) <= new Date(today) && new Date(today) <= new Date(end_date)) {
      initialStatus = 'ONGOING';
    } else if (new Date(today) > new Date(end_date)) {
      initialStatus = 'COMPLETED';
    }

    const query = {
      text: `INSERT INTO create_exams (school_id, exam_name, academic_year, start_date, end_date, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      values: [school_id, exam_name, academic_year, start_date, end_date, initialStatus],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get all exams for a school
  getAllExams: async (school_id) => {
    const query = {
      text: `SELECT * FROM create_exams
             WHERE school_id = $1
             ORDER BY created_at DESC`,
      values: [school_id],
    };
    const result = await pool.query(query);

    // Enrich each exam with its details
    const examsWithDetails = await Promise.all(
      result.rows.map(async (exam) => ({
        ...exam,
        details: await getExamDetailsForId(school_id, exam.id),
      }))
    );

    return examsWithDetails;
  },

  // Get exam by ID
  getExamById: async (school_id, exam_id) => {
    const query = {
      text: `SELECT * FROM create_exams
             WHERE id = $1 AND school_id = $2`,
      values: [exam_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get exam with all details
  getExamWithDetails: async (school_id, exam_id) => {
    const examQuery = {
      text: `SELECT * FROM create_exams
             WHERE id = $1 AND school_id = $2`,
      values: [exam_id, school_id],
    };
    const exam = await pool.query(examQuery);

    if (exam.rows.length === 0) {
      return null;
    }

    const detailsQuery = {
      text: `SELECT ed.*, s.subject_name
             FROM exam_details ed
             LEFT JOIN subjects s ON ed.subject_id = s.id
             WHERE ed.exam_id = $1 AND ed.school_id = $2
             ORDER BY ed.created_at ASC`,
      values: [exam_id, school_id],
    };
    const details = await pool.query(detailsQuery);

    return {
      ...exam.rows[0],
      details: details.rows,
    };
  },

  // Update exam
  updateExam: async (school_id, exam_id, updateData) => {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (updateData.exam_name !== undefined) {
      updates.push(`exam_name = $${paramCount++}`);
      values.push(updateData.exam_name);
    }
    if (updateData.academic_year !== undefined) {
      updates.push(`academic_year = $${paramCount++}`);
      values.push(updateData.academic_year);
    }
    if (updateData.start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(updateData.start_date);
    }
    if (updateData.end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(updateData.end_date);
    }

    if (updates.length === 0) {
      // No updates provided, just return the existing exam
      const query = {
        text: `SELECT * FROM create_exams WHERE id = $1 AND school_id = $2`,
        values: [exam_id, school_id],
      };
      const result = await pool.query(query);
      return result.rows[0];
    }

    updates.push(`updated_at = NOW()`);
    values.push(exam_id);
    values.push(school_id);

    const query = {
      text: `UPDATE create_exams
             SET ${updates.join(', ')}
             WHERE id = $${paramCount++} AND school_id = $${paramCount++}
             RETURNING *`,
      values: values,
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete exam (cascades to exam_details)
  deleteExam: async (school_id, exam_id) => {
    const query = {
      text: `DELETE FROM create_exams
             WHERE id = $1 AND school_id = $2
             RETURNING *`,
      values: [exam_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Create exam detail (single row)
  createExamDetail: async (school_id, detailData) => {
    const {
      exam_id,
      class_id,
      section_id,
      subject_id,
      exam_date,
      max_marks,
      pass_marks,
      teacher_id,
    } = detailData;

    const query = {
      text: `INSERT INTO exam_details
             (school_id, exam_id, class_id, section_id, subject_id, exam_date, max_marks, pass_marks, teacher_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
      values: [
        school_id,
        exam_id,
        class_id,
        section_id,
        subject_id,
        exam_date,
        max_marks,
        pass_marks,
        teacher_id,
      ],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Create multiple exam details (batch)
  createBatchExamDetails: async (school_id, exam_id, detailsArray) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const createdDetails = [];

      for (const detail of detailsArray) {
        const {
          class_id,
          section_id,
          subject_id,
          exam_date,
          max_marks,
          pass_marks,
          teacher_id,
        } = detail;

        const insertQuery = {
          text: `INSERT INTO exam_details
                 (school_id, exam_id, class_id, section_id, subject_id, exam_date, max_marks, pass_marks, teacher_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
          values: [
            school_id,
            exam_id,
            class_id,
            section_id,
            subject_id,
            exam_date,
            max_marks,
            pass_marks,
            teacher_id,
          ],
        };

        try {
          const result = await client.query(insertQuery);
          createdDetails.push(result.rows[0]);
        } catch (detailError) {
          console.error(`[Exam Details Insert Error] Failed to insert detail for subject ${subject_id}:`, detailError.message);
          throw detailError;
        }
      }

      await client.query("COMMIT");
      return createdDetails;
    } catch (error) {
      console.error('[Exam Details Transaction Error]', error.message);
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Get exam details by exam ID
  getExamDetailsByExamId: async (school_id, exam_id) => {
    const query = {
      text: `SELECT ed.*, s.subject_name
             FROM exam_details ed
             LEFT JOIN subjects s ON ed.subject_id = s.id
             WHERE ed.exam_id = $1 AND ed.school_id = $2
             ORDER BY ed.created_at ASC`,
      values: [exam_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get exam detail by ID
  getExamDetailById: async (school_id, detail_id) => {
    const query = {
      text: `SELECT ed.*, s.subject_name
             FROM exam_details ed
             LEFT JOIN subjects s ON ed.subject_id = s.id
             WHERE ed.id = $1 AND ed.school_id = $2`,
      values: [detail_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Update exam detail
  updateExamDetail: async (school_id, detail_id, updateData) => {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (updateData.exam_date !== undefined) {
      updates.push(`exam_date = $${paramCount++}`);
      values.push(updateData.exam_date);
    }
    if (updateData.max_marks !== undefined) {
      updates.push(`max_marks = $${paramCount++}`);
      values.push(updateData.max_marks);
    }
    if (updateData.pass_marks !== undefined) {
      updates.push(`pass_marks = $${paramCount++}`);
      values.push(updateData.pass_marks);
    }
    if (updateData.teacher_id !== undefined) {
      updates.push(`teacher_id = $${paramCount++}`);
      values.push(updateData.teacher_id);
    }

    if (updates.length === 0) {
      // No updates provided, just return the existing detail
      const query = {
        text: `SELECT * FROM exam_details WHERE id = $1 AND school_id = $2`,
        values: [detail_id, school_id],
      };
      const result = await pool.query(query);
      return result.rows[0];
    }

    updates.push(`updated_at = NOW()`);
    values.push(detail_id);
    values.push(school_id);

    const query = {
      text: `UPDATE exam_details
             SET ${updates.join(', ')}
             WHERE id = $${paramCount++} AND school_id = $${paramCount++}
             RETURNING *`,
      values: values,
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete exam detail
  deleteExamDetail: async (school_id, detail_id) => {
    const query = {
      text: `DELETE FROM exam_details
             WHERE id = $1 AND school_id = $2
             RETURNING *`,
      values: [detail_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete all details for an exam (used in unified update)
  deleteExamDetailsByExamId: async (school_id, exam_id) => {
    const query = {
      text: `DELETE FROM exam_details
             WHERE exam_id = $1 AND school_id = $2`,
      values: [exam_id, school_id],
    };
    await pool.query(query);
  },

  // Check if exam detail already exists (for UNIQUE constraint)
  examDetailExists: async (
    school_id,
    exam_id,
    class_id,
    section_id,
    subject_id
  ) => {
    const query = {
      text: `SELECT id FROM exam_details
             WHERE school_id = $1 AND exam_id = $2 AND class_id = $3::uuid AND section_id = $4 AND subject_id = $5
             LIMIT 1`,
      values: [school_id, exam_id, class_id, section_id, subject_id],
    };
    const result = await pool.query(query);
    return result.rows.length > 0;
  },

  // Get exams by academic year
  getExamsByAcademicYear: async (school_id, academic_year) => {
    const query = {
      text: `SELECT * FROM create_exams
             WHERE school_id = $1 AND academic_year = $2
             ORDER BY created_at DESC`,
      values: [school_id, academic_year],
    };
    const result = await pool.query(query);

    // Enrich each exam with its details
    const examsWithDetails = await Promise.all(
      result.rows.map(async (exam) => ({
        ...exam,
        details: await getExamDetailsForId(school_id, exam.id),
      }))
    );

    return examsWithDetails;
  },

  // Update exam status
  updateExamStatus: async (school_id, exam_id, status) => {
    const query = {
      text: `UPDATE create_exams
             SET status = $3, updated_at = NOW()
             WHERE id = $1 AND school_id = $2
             RETURNING *`,
      values: [exam_id, school_id, status],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get exams by status
  getExamsByStatus: async (school_id, status) => {
    const query = {
      text: `SELECT * FROM create_exams
             WHERE school_id = $1 AND status = $2
             ORDER BY created_at DESC`,
      values: [school_id, status],
    };
    const result = await pool.query(query);

    // Enrich each exam with its details
    const examsWithDetails = await Promise.all(
      result.rows.map(async (exam) => ({
        ...exam,
        details: await getExamDetailsForId(school_id, exam.id),
      }))
    );

    return examsWithDetails;
  },
};

module.exports = examsRepository;
