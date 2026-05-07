const svc = require('./admin.timetable.service');

const assertAdmin = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const err = new Error('Forbidden: admins only');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
};

const getPeriodConfig = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year } = req.query;
    const data = await svc.getPeriodConfig({ schoolId: req.user.school_id, class_name, section, academic_year });
    return res.status(200).json({ success: true, data });
  } catch (e) { return next(e); }
};

const upsertPeriodConfig = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year, periods } = req.body;
    const data = await svc.upsertPeriodConfig({ schoolId: req.user.school_id, class_name, section, academic_year, periods });
    return res.status(200).json({ success: true, message: 'Period config saved', data });
  } catch (e) { return next(e); }
};

const getTimetableGrid = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year, day } = req.query;
    const data = await svc.getTimetableGrid({ schoolId: req.user.school_id, class_name, section, academic_year, day });
    return res.status(200).json({ success: true, data });
  } catch (e) { return next(e); }
};

const upsertPeriod = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year, day_of_week, period_number, subject, teacher_id } = req.body;
    const data = await svc.upsertPeriod({
      schoolId: req.user.school_id,
      class_name, section, academic_year, day_of_week, period_number, subject, teacher_id
    });
    return res.status(200).json({ success: true, message: 'Period saved', data });
  } catch (e) { return next(e); }
};

const deletePeriod = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year, day_of_week, period_number } = req.body;
    await svc.deletePeriod({ schoolId: req.user.school_id, class_name, section, academic_year, day_of_week, period_number });
    return res.status(200).json({ success: true, message: 'Period deleted' });
  } catch (e) { return next(e); }
};

const publish = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year } = req.body;
    await svc.setStatus({ schoolId: req.user.school_id, class_name, section, academic_year, status: 'PUBLISHED' });
    return res.status(200).json({ success: true, message: 'Timetable published' });
  } catch (e) { return next(e); }
};

const unpublish = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_name, section, academic_year } = req.body;
    await svc.setStatus({ schoolId: req.user.school_id, class_name, section, academic_year, status: 'DRAFT' });
    return res.status(200).json({ success: true, message: 'Timetable unpublished' });
  } catch (e) { return next(e); }
};

module.exports = { getPeriodConfig, upsertPeriodConfig, getTimetableGrid, upsertPeriod, deletePeriod, publish, unpublish };
