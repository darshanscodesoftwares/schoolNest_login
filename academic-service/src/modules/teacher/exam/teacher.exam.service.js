const examRepository = require('./teacher.exam.repository');

const VALID_TABS = ['upcoming', 'ongoing', 'completed'];

const getExams = async ({ user, query }) => {
  if (user.role !== 'TEACHER') {
    const err = new Error('Access denied: TEACHER role required');
    err.statusCode = 403; err.code = 'FORBIDDEN'; throw err;
  }

  const tab = query.tab || 'upcoming';
  if (!VALID_TABS.includes(tab)) {
    const err = new Error(`tab must be one of: ${VALID_TABS.join(', ')}`);
    err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }

  return examRepository.getExamsByTab({ schoolId: user.school_id, teacherId: user.user_id, tab });
};

const getMarksEntry = async ({ user, params }) => {
  if (user.role !== 'TEACHER') {
    const err = new Error('Access denied: TEACHER role required');
    err.statusCode = 403; err.code = 'FORBIDDEN'; throw err;
  }

  const result = await examRepository.getExamSubjectWithMarks({
    schoolId: user.school_id,
    examSubjectId: params.examSubjectId,
    teacherId: user.user_id
  });

  if (!result) {
    const err = new Error('Exam not found or not assigned to you');
    err.statusCode = 404; err.code = 'NOT_FOUND'; throw err;
  }

  const today = new Date().toISOString().split('T')[0];
  if (result.subject.exam_date >= today) {
    const err = new Error('Marks can only be entered after the exam is completed');
    err.statusCode = 400; err.code = 'EXAM_NOT_COMPLETED'; throw err;
  }

  if (result.subject.result_status === 'SUBMITTED') {
    const err = new Error('Marks already submitted for this exam');
    err.statusCode = 400; err.code = 'ALREADY_SUBMITTED'; throw err;
  }

  return result;
};

const saveMarks = async ({ user, params, body }) => {
  if (user.role !== 'TEACHER') {
    const err = new Error('Access denied: TEACHER role required');
    err.statusCode = 403; err.code = 'FORBIDDEN'; throw err;
  }

  const { action, marks } = body;

  if (!['draft', 'submit'].includes(action)) {
    const err = new Error('action must be draft or submit');
    err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }

  if (!Array.isArray(marks) || marks.length === 0) {
    const err = new Error('marks array is required');
    err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }

  // Verify ownership
  const result = await examRepository.getExamSubjectWithMarks({
    schoolId: user.school_id,
    examSubjectId: params.examSubjectId,
    teacherId: user.user_id
  });

  if (!result) {
    const err = new Error('Exam not found or not assigned to you');
    err.statusCode = 404; err.code = 'NOT_FOUND'; throw err;
  }

  const today = new Date().toISOString().split('T')[0];
  if (result.subject.exam_date >= today) {
    const err = new Error('Marks can only be entered after the exam is completed');
    err.statusCode = 400; err.code = 'EXAM_NOT_COMPLETED'; throw err;
  }

  if (result.subject.result_status === 'SUBMITTED') {
    const err = new Error('Marks already submitted for this exam');
    err.statusCode = 400; err.code = 'ALREADY_SUBMITTED'; throw err;
  }

  // Validate marks values
  const maxMarks = result.subject.max_marks;
  for (const m of marks) {
    if (!m.student_id) {
      const err = new Error('Each mark entry must have student_id');
      err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
    }
    if (!m.is_absent && m.marks_obtained !== null && m.marks_obtained !== undefined) {
      if (m.marks_obtained < 0 || m.marks_obtained > maxMarks) {
        const err = new Error(`marks_obtained must be between 0 and ${maxMarks}`);
        err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
      }
    }
  }

  const resultStatus = action === 'submit' ? 'SUBMITTED' : 'DRAFT';

  await examRepository.saveMarks({
    schoolId: user.school_id,
    examSubjectId: params.examSubjectId,
    marks,
    resultStatus
  });

  return { action, exam_subject_id: params.examSubjectId, result_status: resultStatus };
};

module.exports = { getExams, getMarksEntry, saveMarks };
