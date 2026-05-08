const repo = require('./subject-catalog.repository');

const assertAdmin = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const err = new Error('Forbidden: only administrators can manage subject catalog');
    err.statusCode = 403;
    err.code = 'INSUFFICIENT_PERMISSIONS';
    throw err;
  }
};

const list = async ({ user, includeInactive }) => {
  assertAdmin(user);
  return includeInactive ? repo.listAll() : repo.listActive();
};

const create = async ({ user, subject_name, order_number }) => {
  assertAdmin(user);
  if (!subject_name || !subject_name.trim()) {
    const err = new Error('subject_name is required');
    err.statusCode = 400;
    throw err;
  }
  return repo.create({ subject_name: subject_name.trim(), order_number });
};

const update = async ({ user, id, subject_name, order_number, is_active }) => {
  assertAdmin(user);
  const existing = await repo.getById(id);
  if (!existing) {
    const err = new Error('Subject catalog entry not found');
    err.statusCode = 404;
    throw err;
  }
  return repo.update(id, {
    subject_name: subject_name && subject_name.trim(),
    order_number,
    is_active
  });
};

module.exports = { list, create, update };
