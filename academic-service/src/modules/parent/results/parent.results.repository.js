const pool = require('../../../config/db');

// Get student info for this parent
const getStudentByParent = async ({ schoolId, parentId }) => {
  const { rows } = await pool.query({
    text: `
      SELECT s.id AS student_id, s.name, s.class_id, c.name AS class_name, c.section
      FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.school_id = $1 AND s.parent_id = $2
      LIMIT 1
    `,
    values: [schoolId, parentId]
  });
  return rows[0] || null;
};

// List all exams for child's class (dropdown)
const getExamsForClass = async ({ schoolId, classId }) => {
  const { rows } = await pool.query({
    text: `
      SELECT
        e.id,
        e.name,
        TO_CHAR(e.start_date, 'Mon DD, YYYY') AS start_date,
        BOOL_AND(es.result_status = 'SUBMITTED') AS result_published
      FROM exams e
      JOIN exam_subjects es ON es.exam_id = e.id AND es.class_id = $2
      WHERE e.school_id = $1
      GROUP BY e.id, e.name, e.start_date
      ORDER BY e.start_date DESC
    `,
    values: [schoolId, classId]
  });
  return rows;
};

// Get result detail: all subjects for this exam + class + student marks
const getResultDetail = async ({ schoolId, examId, classId, studentId }) => {
  const examRes = await pool.query({
    text: `
      SELECT id, name, TO_CHAR(start_date, 'Mon DD, YYYY') AS start_date
      FROM exams
      WHERE school_id = $1 AND id = $2
    `,
    values: [schoolId, examId]
  });

  const exam = examRes.rows[0] || null;
  if (!exam) return null;

  const subjectsRes = await pool.query({
    text: `
      SELECT
        es.subject_name,
        es.max_marks,
        es.pass_marks,
        es.result_status,
        er.marks_obtained,
        er.is_absent
      FROM exam_subjects es
      LEFT JOIN exam_results er ON er.exam_subject_id = es.id AND er.student_id = $4
      WHERE es.school_id = $1 AND es.exam_id = $2 AND es.class_id = $3
      ORDER BY es.exam_date ASC
    `,
    values: [schoolId, examId, classId, studentId]
  });

  return { exam, subjects: subjectsRes.rows };
};

module.exports = {
  getStudentByParent,
  getExamsForClass,
  getResultDetail
};
