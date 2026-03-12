const announcementService = require('./parent.announcement.service');

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

module.exports = { getAnnouncements, getAnnouncementDetail };
