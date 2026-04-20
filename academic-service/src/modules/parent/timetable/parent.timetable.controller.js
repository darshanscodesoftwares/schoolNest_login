const timetableService = require('./parent.timetable.service');

const getStudentTimetable = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { day } = req.query;
    const result = await timetableService.getStudentTimetable({
      user: req.user,
      studentId,
      day
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStudentTimetable
};
