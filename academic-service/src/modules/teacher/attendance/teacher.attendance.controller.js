const attendanceService = require('./teacher.attendance.service');

const getTeacherClasses = async (req, res, next) => {
  try {
    const classes = await attendanceService.getTeacherClasses(req.user);
    return res.status(200).json({
      success: true,
      data: classes
    });
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
    const { class_id: classId, attendance_date: date, attendance } = req.body;

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

const getAttendanceStatuses = async (req, res, next) => {
  try {
    const statuses = await attendanceService.getAttendanceStatuses(req.user);
    return res.status(200).json(statuses);
  } catch (error) {
    return next(error);
  }
};

const getAttendanceHistory = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { from_date, to_date } = req.query;

    const result = await attendanceService.getAttendanceHistory({
      user: req.user,
      classId,
      fromDate: from_date,
      toDate: to_date
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getStudentSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const result = await attendanceService.getStudentAttendanceSummary({
      user: req.user,
      studentId
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { month } = req.query;

    const result = await attendanceService.getClassAttendanceReport({
      user: req.user,
      classId,
      month
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { status } = req.body;

    const result = await attendanceService.updateAttendanceRecord({
      user: req.user,
      recordId,
      status
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const { recordId } = req.params;

    const result = await attendanceService.deleteAttendanceRecord({
      user: req.user,
      recordId
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTeacherClasses,
  getClassStudents,
  submitAttendance,
  getAttendanceStatuses,
  getAttendanceHistory,
  getStudentSummary,
  getClassReport,
  updateAttendance,
  deleteAttendance
};
