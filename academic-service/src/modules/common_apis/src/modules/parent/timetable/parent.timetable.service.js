const timetableRepository = require('./parent.timetable.repository');

const assertParentRole = (user) => {
  if (!user || user.role !== 'PARENT') {
    const error = new Error('Forbidden: only parents can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const getStudentTimetable = async ({ user, studentId }) => {
  assertParentRole(user);

  const student = await timetableRepository.getStudentByParent({
    studentId,
    parentId: user.user_id,
    schoolId: user.school_id
  });

  if (!student) {
    const error = new Error('Student does not belong to this parent');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const rows = await timetableRepository.getTimetableByClass({
    schoolId: user.school_id,
    classId: student.class_id
  });

  const timetable = {};
  for (const row of rows) {
    if (!timetable[row.day_of_week]) {
      timetable[row.day_of_week] = [];
    }
    timetable[row.day_of_week].push(row.subject);
  }

  return {
    student: { id: student.id, name: student.name },
    timetable
  };
};

module.exports = {
  getStudentTimetable
};
