const svc = require('./classes.service');

const assertAdmin = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const err = new Error('Forbidden: admins only');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
};

const createClassWithSections = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_template_id, section_template_ids } = req.body;
    const data = await svc.createClassWithSections({
      schoolId:           req.user.school_id,
      classTemplateId:    class_template_id,
      sectionTemplateIds: section_template_ids
    });
    return res.status(200).json({ success: true, message: 'Class created', data });
  } catch (e) { return next(e); }
};

const listClasses = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const data = await svc.listClasses({ schoolId: req.user.school_id });
    return res.status(200).json({ success: true, data });
  } catch (e) { return next(e); }
};

const listSections = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const data = await svc.listSections({
      schoolId: req.user.school_id,
      classId:  req.params.classId
    });
    return res.status(200).json({ success: true, data });
  } catch (e) { return next(e); }
};

const nextAvailableSection = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const data = await svc.nextAvailableSection({
      schoolId: req.user.school_id,
      classId:  req.params.classId
    });
    return res.status(200).json({ success: true, data });
  } catch (e) { return next(e); }
};

const attachSection = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const data = await svc.attachSection({
      schoolId:          req.user.school_id,
      classId:           req.params.classId,
      sectionTemplateId: req.body.section_template_id
    });
    return res.status(200).json({ success: true, message: 'Section attached', data });
  } catch (e) { return next(e); }
};

const detachSection = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    await svc.detachSection({
      schoolId:       req.user.school_id,
      classId:        req.params.classId,
      classSectionId: req.params.classSectionId
    });
    return res.status(200).json({ success: true, message: 'Section detached' });
  } catch (e) { return next(e); }
};

const bulkSaveStructure = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const { class_template_ids, section_template_ids } = req.body;
    const data = await svc.bulkSaveStructure({
      schoolId:           req.user.school_id,
      classTemplateIds:   class_template_ids,
      sectionTemplateIds: section_template_ids
    });
    return res.status(200).json({ success: true, message: 'Class structure saved', data });
  } catch (e) { return next(e); }
};

const deleteClass = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    await svc.deleteClass({
      schoolId: req.user.school_id,
      classId:  req.params.classId
    });
    return res.status(200).json({ success: true, message: 'Class removed' });
  } catch (e) { return next(e); }
};

module.exports = {
  createClassWithSections,
  listClasses,
  listSections,
  nextAvailableSection,
  attachSection,
  detachSection,
  deleteClass,
  bulkSaveStructure
};
