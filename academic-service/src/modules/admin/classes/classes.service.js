const repo = require('./classes.repository');

// ─── Popup endpoint ──────────────────────────────────────────────────────

// Popup payload:
//   { class_template_id, section_template_ids?: [uuid, uuid, ...] }
// section_template_ids is OPTIONAL — defaults A/B/C/D are always attached.
const createClassWithSections = async ({ schoolId, classTemplateId, sectionTemplateIds }) => {
  if (!classTemplateId) {
    const err = new Error('class_template_id is required');
    err.statusCode = 400;
    err.code       = 'VALIDATION_ERROR';
    throw err;
  }

  const classTpl = await repo.getClassTemplate(classTemplateId);
  if (!classTpl) {
    const err = new Error('Class template not found');
    err.statusCode = 404;
    err.code       = 'CLASS_TEMPLATE_NOT_FOUND';
    throw err;
  }

  const allActive     = await repo.listActiveSectionTemplatesOrdered();
  const defaults      = allActive.filter(t => t.is_default);
  const defaultIdSet  = new Set(defaults.map(d => d.id));
  const allActiveById = new Map(allActive.map(t => [t.id, t]));

  const extras       = Array.isArray(sectionTemplateIds) ? sectionTemplateIds : [];
  const uniqueExtras = Array.from(new Set(extras)).filter(id => !defaultIdSet.has(id));
  for (const id of uniqueExtras) {
    if (!allActiveById.has(id)) {
      const err = new Error('One or more section_template_ids are invalid');
      err.statusCode = 400;
      err.code       = 'INVALID_SECTION_TEMPLATE';
      throw err;
    }
  }

  const mergedIdSet = new Set([...defaultIdSet, ...uniqueExtras]);

  // Materialise templates in canonical order for the insert
  const sectionTemplates = allActive.filter(t => mergedIdSet.has(t.id));

  return repo.createClassWithSectionsTxn({
    schoolId,
    classTemplateId,
    className: classTpl.class_name,
    orderNumber: classTpl.order_number,
    sectionTemplates
  });
};

// ─── Listings ────────────────────────────────────────────────────────────

const listClasses = async ({ schoolId }) => repo.listClasses(schoolId);

const listSections = async ({ schoolId, classId }) => {
  if (!classId) {
    const err = new Error('classId is required');
    err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }
  const cls = await repo.getSchoolClassById({ schoolId, classId });
  if (!cls) {
    const err = new Error('Class not found for this school');
    err.statusCode = 404; err.code = 'CLASS_NOT_FOUND'; throw err;
  }
  return repo.listSections({ schoolId, classId });
};

const nextAvailableSection = async ({ schoolId, classId }) => {
  const cls = await repo.getSchoolClassById({ schoolId, classId });
  if (!cls) {
    const err = new Error('Class not found for this school');
    err.statusCode = 404; err.code = 'CLASS_NOT_FOUND'; throw err;
  }
  const allActive = await repo.listActiveSectionTemplatesOrdered();
  const current   = await repo.listSections({ schoolId, classId });
  if (current.length >= allActive.length) return null;
  return allActive[current.length];
};

// ─── Attach / detach (enforce ordering + default-lock) ───────────────────

const attachSection = async ({ schoolId, classId, sectionTemplateId }) => {
  if (!sectionTemplateId) {
    const err = new Error('section_template_id is required');
    err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }

  const cls = await repo.getSchoolClassById({ schoolId, classId });
  if (!cls) {
    const err = new Error('Class not found for this school');
    err.statusCode = 404; err.code = 'CLASS_NOT_FOUND'; throw err;
  }

  const allActive = await repo.listActiveSectionTemplatesOrdered();
  const allActiveById = new Map(allActive.map(t => [t.id, t]));
  const tpl = allActiveById.get(sectionTemplateId);
  if (!tpl) {
    const err = new Error('Invalid section_template_id');
    err.statusCode = 400; err.code = 'INVALID_SECTION_TEMPLATE'; throw err;
  }

  const current      = await repo.listSections({ schoolId, classId });
  const currentIdSet = new Set(current.map(c => c.section_template_id));
  if (currentIdSet.has(sectionTemplateId)) {
    const err = new Error('Section already attached to this class');
    err.statusCode = 409; err.code = 'SECTION_ALREADY_ATTACHED'; throw err;
  }

  const attached = await repo.attachSection({
    schoolId, classId,
    sectionTemplateId,
    sectionName: tpl.section_name
  });
  return { id: attached.id, section_template_id: attached.section_template_id, section_name: attached.section_name, is_default: tpl.is_default };
};

const detachSection = async ({ schoolId, classId, classSectionId }) => {
  const cls = await repo.getSchoolClassById({ schoolId, classId });
  if (!cls) {
    const err = new Error('Class not found for this school');
    err.statusCode = 404; err.code = 'CLASS_NOT_FOUND'; throw err;
  }

  const row = await repo.getClassSectionWithTemplate({ schoolId, classId, classSectionId });
  if (!row) {
    const err = new Error('Section not found on this class');
    err.statusCode = 404; err.code = 'SECTION_NOT_FOUND'; throw err;
  }

  await repo.detachSection({ schoolId, classId, classSectionId });
};

const deleteClass = async ({ schoolId, classId }) => {
  if (!classId) {
    const err = new Error('classId is required');
    err.statusCode = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }
  const cls = await repo.getSchoolClassById({ schoolId, classId });
  if (!cls) {
    const err = new Error('Class not found for this school');
    err.statusCode = 404; err.code = 'CLASS_NOT_FOUND'; throw err;
  }
  const deleted = await repo.deleteClass({ schoolId, classId });
  if (!deleted) {
    const err = new Error('Failed to delete class');
    err.statusCode = 500; err.code = 'DELETE_FAILED'; throw err;
  }
};

module.exports = {
  createClassWithSections,
  listClasses,
  listSections,
  nextAvailableSection,
  attachSection,
  detachSection,
  deleteClass
};
