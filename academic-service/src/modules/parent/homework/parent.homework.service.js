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

const getHomework = async ({ user, tab, studentId }) => {
  assertParentRole(user);

  const resolvedTab = tab || 'today';

  if (!VALID_TABS.has(resolvedTab)) {
    const error = new Error('tab must be one of: today, upcoming');
    error.statusCode = 400;
    error.code = 'INVALID_TAB';
    throw error;
  }

  // Get all children of this parent
  let students = await homeworkRepository.getStudentsByParent({
    schoolId: user.school_id,
    parentId: user.user_id
  });

  // Optional: filter to a single child. Reject if the studentId isn't theirs.
  if (studentId) {
    const owned = students.find((s) => s.student_id === studentId);
    if (!owned) {
      const error = new Error('Parent not authorized for this student');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }
    students = [owned];
  }

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
      }).then((rows) => ({ student, rows }))
    )
  );

  // Flatten + dedupe by homework id, accumulating which children each homework applies to.
  // A parent with siblings in the same class sees one homework row tagged with both kids.
  const byId = new Map();
  for (const { student, rows } of homeworkArrays) {
    for (const hw of rows) {
      const existing = byId.get(hw.id);
      const studentRef = { student_id: student.student_id, student_name: student.name };
      if (existing) {
        existing.students.push(studentRef);
      } else {
        byId.set(hw.id, Object.assign({}, hw, { students: [studentRef] }));
      }
    }
  }

  const homework = Array.from(byId.values())
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return {
    success: true,
    tab: resolvedTab,
    total: homework.length,
    homework
  };
};

module.exports = { getHomework };
