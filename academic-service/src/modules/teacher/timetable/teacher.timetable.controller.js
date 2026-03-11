const timetableService = require('./teacher.timetable.service');

const getTimetable = async (req, res, next) => {
  try {
    const { day } = req.query;

    const result = await timetableService.getTimetable({
      user: req.user,
      day
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getClassDetail = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const result = await timetableService.getClassDetail({
      user: req.user,
      classId
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getTimetable, getClassDetail };
