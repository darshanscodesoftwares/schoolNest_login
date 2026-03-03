const attendanceService = require('../services/attendance.service');

const getTeacherClasses = async (req, res, next) => {
  try {
    const classes = await attendanceService.getTeacherClasses(req.user);
    return res.status(200).json(classes);
  } catch (error) {
    return next(error);
  }
};

const getClassStudents = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const response = await attendanceService.getClassStudentsWithAttendance({
      user: req.user,
      classId,
      date
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

const submitAttendance = async (req, res, next) => {
  try {
    const { class_id: classId, date, attendance } = req.body;

    const result = await attendanceService.submitAttendance({
      user: req.user,
      classId,
      date,
      attendance
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTeacherClasses,
  getClassStudents,
  submitAttendance
};
