const repo = require('./master-data.repository');
const { RESOURCES } = require('./master-data.config');

function err(message, statusCode, code) {
  const e = new Error(message);
  e.statusCode = statusCode;
  e.code = code;
  return e;
}

async function list(resource, schoolId) {
  const rows = await repo.list(resource, schoolId);
  return {
    success: true,
    count: rows.length,
    data: rows,
  };
}

async function getById(resource, schoolId, id) {
  const row = await repo.getById(resource, schoolId, id);
  if (!row) throw err(`${resource.label} not found`, 404, 'NOT_FOUND');
  return { success: true, data: row };
}

async function create(resource, schoolId, body) {
  const name = body[resource.nameColumn] || body.name;
  if (!name || !String(name).trim()) {
    throw err(`${resource.nameColumn} is required`, 400, 'VALIDATION_ERROR');
  }
  const orderNumber = body.order_number;
  try {
    const row = await repo.create(resource, schoolId, String(name).trim(), orderNumber);
    return { success: true, message: `${resource.label} created`, data: row };
  } catch (e) {
    if (e.code === '23505') {
      throw err(`${resource.label} '${name}' already exists`, 409, 'DUPLICATE');
    }
    throw e;
  }
}

async function update(resource, schoolId, id, body) {
  const name = body[resource.nameColumn] || body.name;
  const orderNumber = body.order_number;
  try {
    const row = await repo.update(
      resource,
      schoolId,
      id,
      name !== undefined ? String(name).trim() : undefined,
      orderNumber
    );
    if (!row) throw err(`${resource.label} not found`, 404, 'NOT_FOUND');
    return { success: true, message: `${resource.label} updated`, data: row };
  } catch (e) {
    if (e.code === '23505') {
      throw err(`${resource.label} name already exists`, 409, 'DUPLICATE');
    }
    throw e;
  }
}

async function remove(resource, schoolId, id) {
  try {
    const ok = await repo.remove(resource, schoolId, id);
    if (!ok) throw err(`${resource.label} not found`, 404, 'NOT_FOUND');
    return { success: true, message: `${resource.label} deleted` };
  } catch (e) {
    if (e.code === '23503') {
      throw err(`${resource.label} is in use and cannot be deleted`, 409, 'IN_USE');
    }
    throw e;
  }
}

// Fetch every lookup resource in one call — for FE dropdown bootstrapping
// and fast manual testing in Swagger.
async function listAll(schoolId) {
  const slugs = Object.keys(RESOURCES);
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const resource = RESOURCES[slug];
      const rows = await repo.list(resource, schoolId);
      // Normalise output: every row exposes id + name regardless of underlying column
      const normalised = rows.map((r) => ({
        id:           r.id,
        name:         r[resource.nameColumn],
        order_number: r.order_number != null ? r.order_number : null,
      }));
      return [slug, normalised];
    })
  );
  return {
    success: true,
    data: Object.fromEntries(results),
  };
}

module.exports = { list, getById, create, update, remove, listAll };
