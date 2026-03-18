const announcementService = require('./teacher.announcement.service');

const sendAnnouncement = async (req, res, next) => {
  try {
    const {
      class_id: classId,
      audience_type: audienceType,
      student_ids: studentIds,
      title,
      message,
      is_important: isImportant
    } = req.body;

    const result = await announcementService.sendAnnouncement({
      user: req.user,
      classId,
      audienceType,
      studentIds,
      title,
      message,
      isImportant
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const { tab } = req.query;

    const result = await announcementService.getAnnouncements({
      user: req.user,
      tab
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getAnnouncementDetail = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    const result = await announcementService.getAnnouncementDetail({
      user: req.user,
      announcementId
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { sendAnnouncement, getAnnouncements, getAnnouncementDetail };
