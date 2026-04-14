const parentService = require('./parent.attendance.service');

const getParentStudents = async (req, res, next) => {
  try {
    const students = await parentService.getParentStudents(req.user);
    return res.status(200).json({ success: true, students });
  } catch (error) {
    return next(error);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const result = await parentService.getAttendanceSummary({
      user: req.user,
      studentId
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

const getMonthlyAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;
    const result = await parentService.getMonthlyAttendance({
      user: req.user,
      studentId,
      month
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

const getRecentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const result = await parentService.getRecentAttendance({
      user: req.user,
      studentId
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getParentStudents,
  getAttendanceSummary,
  getMonthlyAttendance,
  getRecentAttendance
};
