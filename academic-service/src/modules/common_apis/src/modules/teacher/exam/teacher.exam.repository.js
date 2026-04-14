const pool = require('../../../config/db');

// List exam subjects for teacher by tab
const getExamsByTab = async ({ schoolId, teacherId, tab }) => {
  let whereClause;

  if (tab === 'upcoming') {
    whereClause = `es.school_id = $1 AND es.teacher_id = $2 AND es.exam_date > CURRENT_DATE`;
  } else if (tab === 'ongoing') {
    whereClause = `es.school_id = $1 AND es.teacher_id = $2 AND es.exam_date = CURRENT_DATE`;
  } else {
    // completed — exam date has passed (regardless of result_status)
    whereClause = `es.school_id = $1 AND es.teacher_id = $2 AND es.exam_date < CURRENT_DATE`;
  }

  const { rows } = await pool.query({
    text: `
      SELECT
        es.id AS exam_subject_id,
        e.name AS exam_name,
        es.subject_name,
        c.name AS class_name,
        c.section,
        TO_CHAR(es.exam_date, 'YYYY-MM-DD') AS exam_date,
        es.max_marks,
        es.result_status
      FROM exam_subjects es
      JOIN exams e ON e.id = es.exam_id
      JOIN classes c ON c.id = es.class_id
      WHERE ${whereClause}
      ORDER BY es.exam_date ASC
    `,
    values: [schoolId, teacherId]
  });

  return rows;
};

// Get exam subject detail + students with existing marks
const getExamSubjectWithMarks = async ({ schoolId, examSubjectId, teacherId }) => {
  const subjectRes = await pool.query({
    text: `
      SELECT
        es.id,
        e.name AS exam_name,
        es.subject_name,
        c.name AS class_name,
        c.section,
        es.class_id,
        TO_CHAR(es.exam_date, 'YYYY-MM-DD') AS exam_date,
        es.max_marks,
        es.pass_marks,
        es.result_status
      FROM exam_subjects es
      JOIN exams e ON e.id = es.exam_id
      JOIN classes c ON c.id = es.class_id
      WHERE es.school_id = $1 AND es.id = $2 AND es.teacher_id = $3
    `,
    values: [schoolId, examSubjectId, teacherId]
  });

  const subject = subjectRes.rows[0] || null;
  if (!subject) return null;

  const studentsRes = await pool.query({
    text: `
      SELECT
        s.id AS student_id,
        s.name,
        s.roll_no,
        er.marks_obtained,
        er.is_absent
      FROM students s
      LEFT JOIN exam_results er ON er.student_id = s.id AND er.exam_subject_id = $2
      WHERE s.school_id = $1 AND s.class_id = $3
      ORDER BY s.roll_no ASC
    `,
    values: [schoolId, examSubjectId, subject.class_id]
  });

  return { subject, students: studentsRes.rows };
};

// Upsert marks + update result_status (transactional)
const saveMarks = async ({ schoolId, examSubjectId, marks, resultStatus }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (marks.length > 0) {
      const placeholders = marks.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(', ');
      const values = marks.flatMap((m) => [
        examSubjectId,
        schoolId,
        m.student_id,
        m.is_absent ? null : m.marks_obtained,
        m.is_absent || false
      ]);

      await client.query({
        text: `
          INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent)
          VALUES ${placeholders}
          ON CONFLICT (exam_subject_id, student_id)
          DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, is_absent = EXCLUDED.is_absent
        `,
        values
      });
    }

    await client.query({
      text: `UPDATE exam_subjects SET result_status = $1 WHERE id = $2`,
      values: [resultStatus, examSubjectId]
    });

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getExamsByTab,
  getExamSubjectWithMarks,
  saveMarks
};
