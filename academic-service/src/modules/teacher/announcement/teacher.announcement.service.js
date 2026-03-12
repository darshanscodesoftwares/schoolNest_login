const announcementRepository = require('./teacher.announcement.repository');

const VALID_TABS = new Set(['sent', 'inbox']);

const assertTeacherRole = (user) => {
  if (!user || user.role !== 'TEACHER') {
    const error = new Error('Forbidden: only teachers can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const sendAnnouncement = async ({ user, classId, audienceType, studentIds, title, message, isImportant }) => {
  assertTeacherRole(user);

  if (!classId || !audienceType || !message) {
    const error = new Error('class_id, audience_type, and message are required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!['full_class', 'specific_students'].includes(audienceType)) {
    const error = new Error('audience_type must be full_class or specific_students');
    error.statusCode = 400;
    error.code = 'INVALID_AUDIENCE_TYPE';
    throw error;
  }

  if (audienceType === 'specific_students' && (!studentIds || !studentIds.length)) {
    const error = new Error('student_ids are required for specific_students audience type');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const classOwned = await announcementRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Class not found for this teacher');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  // Resolve recipient parent_ids
  let recipientIds;
  if (audienceType === 'full_class') {
    recipientIds = await announcementRepository.getParentsByClass({
      schoolId: user.school_id,
      classId
    });
  } else {
    recipientIds = await announcementRepository.getParentsByStudents({
      schoolId: user.school_id,
      studentIds
    });
  }

  if (!recipientIds.length) {
    const error = new Error('No recipients found — students may not have linked parents');
    error.statusCode = 400;
    error.code = 'NO_RECIPIENTS';
    throw error;
  }

  const announcement = await announcementRepository.createAnnouncement({
    schoolId: user.school_id,
    senderId: user.user_id,
    senderName: user.name || 'Teacher',
    senderRole: user.role,
    classId,
    audienceType,
    title: title || null,
    message,
    isImportant: isImportant || false,
    recipientIds
  });

  return {
    success: true,
    message: 'Announcement sent successfully',
    announcement_id: announcement.id,
    recipient_count: announcement.recipient_count,
    class_name: classOwned.name,
    section: classOwned.section
  };
};

const getAnnouncements = async ({ user, tab }) => {
  assertTeacherRole(user);

  const resolvedTab = tab || 'inbox';

  if (!VALID_TABS.has(resolvedTab)) {
    const error = new Error('tab must be one of: sent, inbox');
    error.statusCode = 400;
    error.code = 'INVALID_TAB';
    throw error;
  }

  const announcements = await announcementRepository.getAnnouncementsByTab({
    schoolId: user.school_id,
    userId: user.user_id,
    tab: resolvedTab
  });

  return {
    success: true,
    tab: resolvedTab,
    total: announcements.length,
    announcements
  };
};

const getAnnouncementDetail = async ({ user, announcementId }) => {
  assertTeacherRole(user);

  const announcement = await announcementRepository.getAnnouncementById({
    schoolId: user.school_id,
    announcementId
  });

  if (!announcement) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Auto mark as read if teacher is a recipient (inbox)
  if (announcement.sender_id !== user.user_id) {
    await announcementRepository.markAsRead({
      schoolId: user.school_id,
      announcementId,
      recipientId: user.user_id
    });
  }

  return { success: true, announcement };
};

module.exports = { sendAnnouncement, getAnnouncements, getAnnouncementDetail };
