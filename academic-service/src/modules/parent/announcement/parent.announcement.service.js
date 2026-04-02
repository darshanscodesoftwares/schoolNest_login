const announcementRepository = require('./parent.announcement.repository');

const VALID_TABS = new Set(['all', 'important']);

const assertParentRole = (user) => {
  if (!user || user.role !== 'PARENT') {
    const error = new Error('Forbidden: only parents can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const getAnnouncements = async ({ user, tab }) => {
  assertParentRole(user);

  const resolvedTab = tab || 'all';

  if (!VALID_TABS.has(resolvedTab)) {
    const error = new Error('tab must be one of: all, important');
    error.statusCode = 400;
    error.code = 'INVALID_TAB';
    throw error;
  }

  const announcements = await announcementRepository.getAnnouncementsForParent({
    schoolId: user.school_id,
    parentId: user.user_id,
    tab: resolvedTab
  });

  const unread_count = announcements.filter((a) => !a.is_read).length;

  return {
    success: true,
    tab: resolvedTab,
    total: announcements.length,
    unread_count,
    announcements
  };
};

const getAnnouncementDetail = async ({ user, announcementId }) => {
  assertParentRole(user);

  const announcement = await announcementRepository.getAnnouncementById({
    schoolId: user.school_id,
    announcementId,
    parentId: user.user_id
  });

  if (!announcement) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Auto mark as read on open
  if (!announcement.is_read) {
    await announcementRepository.markAsRead({
      schoolId: user.school_id,
      announcementId,
      parentId: user.user_id
    });
  }

  return { success: true, announcement };
};

module.exports = { getAnnouncements, getAnnouncementDetail };
