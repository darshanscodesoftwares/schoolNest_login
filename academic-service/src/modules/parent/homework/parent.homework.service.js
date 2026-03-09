const homeworkRepository = require('./parent.homework.repository');

const VALID_TABS = new Set(['today', 'upcoming']);

const assertParentRole = (user) => {
  if (!user || user.role !== 'PARENT') {
    const error = new Error('Forbidden: only parents can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const getHomework = async ({ user, tab }) => {
  assertParentRole(user);

  const resolvedTab = tab || 'today';

  if (!VALID_TABS.has(resolvedTab)) {
    const error = new Error('tab must be one of: today, upcoming');
    error.statusCode = 400;
    error.code = 'INVALID_TAB';
    throw error;
  }

  // Get all children of this parent
  const students = await homeworkRepository.getStudentsByParent({
    schoolId: user.school_id,
    parentId: user.user_id
  });

  if (!students.length) {
    return {
      success: true,
      tab: resolvedTab,
      total: 0,
      homework: []
    };
  }

  // Fetch homework for each child's class in parallel
  const homeworkArrays = await Promise.all(
    students.map((student) =>
      homeworkRepository.getHomeworkForClass({
        schoolId: user.school_id,
        classId: student.class_id,
        tab: resolvedTab
      })
    )
  );

  // Flatten + deduplicate (siblings may share a class)
  const seen = new Set();
  const homework = [];
  for (const arr of homeworkArrays) {
    for (const hw of arr) {
      if (!seen.has(hw.id)) {
        seen.add(hw.id);
        homework.push(hw);
      }
    }
  }

  homework.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return {
    success: true,
    tab: resolvedTab,
    total: homework.length,
    homework
  };
};

module.exports = { getHomework };
