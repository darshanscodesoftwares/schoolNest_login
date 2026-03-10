const timetableService = require('./teacher.timetable.service');

const getTimetableByDay = async (req, res, next) => {
  try {
    const { day } = req.query;

    const result = await timetableService.getTimetableByDay({
      user: req.user,
      day
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getNextClass = async (req, res, next) => {
  try {
    const result = await timetableService.getNextClass({ user: req.user });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getClassSummary = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const result = await timetableService.getClassSummary({
      user: req.user,
      classId
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const result = await timetableService.getRecentActivity({
      user: req.user,
      classId
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTimetableByDay,
  getNextClass,
  getClassSummary,
  getRecentActivity
};
