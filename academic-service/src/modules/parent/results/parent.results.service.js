const resultsRepository = require('./parent.results.repository');

const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const getPerformanceMessages = (subjects, overallPercentage) => {
  const messages = [];

  // Overall message
  if (overallPercentage >= 90) {
    messages.push({ title: 'Great Progress!', body: 'Overall performance is excellent' });
  } else if (overallPercentage >= 75) {
    messages.push({ title: 'Good Performance!', body: 'Keep it up' });
  } else if (overallPercentage >= 60) {
    messages.push({ title: 'Average Performance', body: 'Focus more on studies' });
  } else {
    messages.push({ title: 'Needs Improvement', body: 'Please work harder' });
  }

  // Per-subject low marks
  subjects.forEach((s) => {
    if (!s.is_absent && s.marks_obtained !== null) {
      const pct = (s.marks_obtained / s.max_marks) * 100;
      if (pct < 50) {
        messages.push({
          title: `Needs Improvement in ${s.subject_name}`,
          body: `${s.subject_name} marks can be improved with more practice`
        });
      }
    }
  });

  return messages;
};

const getExamsList = async ({ user }) => {
  if (user.role !== 'PARENT') {
    const err = new Error('Access denied: PARENT role required');
    err.statusCode = 403; err.code = 'FORBIDDEN'; throw err;
  }

  const student = await resultsRepository.getStudentByParent({ schoolId: user.school_id, parentId: user.user_id });

  if (!student) {
    const err = new Error('No student found for this parent');
    err.statusCode = 404; err.code = 'STUDENT_NOT_FOUND'; throw err;
  }

  const exams = await resultsRepository.getExamsForClass({ schoolId: user.school_id, classId: student.class_id });

  return {
    student: { name: student.name, class_name: student.class_name, section: student.section },
    exams
  };
};

const getResultDetail = async ({ user, params }) => {
  if (user.role !== 'PARENT') {
    const err = new Error('Access denied: PARENT role required');
    err.statusCode = 403; err.code = 'FORBIDDEN'; throw err;
  }

  const student = await resultsRepository.getStudentByParent({ schoolId: user.school_id, parentId: user.user_id });

  if (!student) {
    const err = new Error('No student found for this parent');
    err.statusCode = 404; err.code = 'STUDENT_NOT_FOUND'; throw err;
  }

  const data = await resultsRepository.getResultDetail({
    schoolId: user.school_id,
    examId: params.examId,
    classId: student.class_id,
    studentId: student.student_id
  });

  if (!data) {
    const err = new Error('Exam not found');
    err.statusCode = 404; err.code = 'NOT_FOUND'; throw err;
  }

  const allSubmitted = data.subjects.length > 0 && data.subjects.every((s) => s.result_status === 'SUBMITTED');

  if (!allSubmitted) {
    return {
      exam: data.exam,
      result_published: false,
      summary: null,
      subjects: [],
      performance_messages: []
    };
  }

  // Compute totals (exclude absent students from total)
  let totalObtained = 0;
  let totalMax = 0;
  data.subjects.forEach((s) => {
    totalMax += s.max_marks;
    if (!s.is_absent && s.marks_obtained !== null) {
      totalObtained += s.marks_obtained;
    }
  });

  const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
  const grade = getGrade(percentage);

  const subjects = data.subjects.map((s) => ({
    subject_name: s.subject_name,
    marks_obtained: s.is_absent ? null : s.marks_obtained,
    max_marks: s.max_marks,
    pass_marks: s.pass_marks,
    is_absent: s.is_absent,
    status: s.is_absent ? 'Absent' : 'Present'
  }));

  return {
    exam: data.exam,
    result_published: true,
    summary: {
      total_marks: totalObtained,
      max_marks: totalMax,
      percentage,
      grade
    },
    subjects,
    performance_messages: getPerformanceMessages(subjects, percentage)
  };
};

module.exports = { getExamsList, getResultDetail };
