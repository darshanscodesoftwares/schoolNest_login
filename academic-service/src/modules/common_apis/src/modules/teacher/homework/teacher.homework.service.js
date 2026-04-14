const homeworkRepository = require('./teacher.homework.repository');

const VALID_TABS = new Set(['today', 'upcoming', 'completed']);

const assertTeacherRole = (user) => {
  if (!user || user.role !== 'TEACHER') {
    const error = new Error('Forbidden: only teachers can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const createHomework = async ({ user, classId, subject, title, description, dueDate, attachmentUrl }) => {
  assertTeacherRole(user);

  if (!classId || !subject || !title || !description || !dueDate) {
    const error = new Error('class_id, subject, title, description, and due_date are required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (Number.isNaN(new Date(dueDate).getTime())) {
    const error = new Error('Invalid due_date. Use format YYYY-MM-DD');
    error.statusCode = 400;
    error.code = 'INVALID_DATE_FORMAT';
    throw error;
  }

  const classOwned = await homeworkRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Class not found for this teacher in current school');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  const homework = await homeworkRepository.createHomework({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id,
    subject,
    title,
    description,
    dueDate,
    attachmentUrl: attachmentUrl || null
  });

  return {
    success: true,
    message: 'Homework created successfully',
    homework
  };
};

const getHomework = async ({ user, tab }) => {
  assertTeacherRole(user);

  const resolvedTab = tab || 'today';

  if (!VALID_TABS.has(resolvedTab)) {
    const error = new Error('tab must be one of: today, upcoming, completed');
    error.statusCode = 400;
    error.code = 'INVALID_TAB';
    throw error;
  }

  const homework = await homeworkRepository.getHomeworkByTab({
    schoolId: user.school_id,
    teacherId: user.user_id,
    tab: resolvedTab
  });

  return {
    success: true,
    tab: resolvedTab,
    total: homework.length,
    homework
  };
};

// Used by timetable class detail screen to show homework for a specific class
const getHomeworkByClass = async ({ user, classId, tab }) => {
  assertTeacherRole(user);

  const resolvedTab = tab || 'today';

  if (!VALID_TABS.has(resolvedTab)) {
    const error = new Error('tab must be one of: today, upcoming, completed');
    error.statusCode = 400;
    error.code = 'INVALID_TAB';
    throw error;
  }

  const classOwned = await homeworkRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Class not found for this teacher in current school');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  const homework = await homeworkRepository.getHomeworkByClass({
    schoolId: user.school_id,
    classId,
    tab: resolvedTab
  });

  return {
    success: true,
    class_id: classId,
    tab: resolvedTab,
    total: homework.length,
    homework
  };
};

module.exports = {
  createHomework,
  getHomework,
  getHomeworkByClass
};
