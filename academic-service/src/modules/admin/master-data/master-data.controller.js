const service = require('./master-data.service');
const { RESOURCES } = require('./master-data.config');

// Resolve URL slug → resource config; respond 404 if unknown
function resolveResource(req, res) {
  const resource = RESOURCES[req.params.resource];
  if (!resource) {
    res.status(404).json({ success: false, code: 'UNKNOWN_RESOURCE', message: `Unknown lookup resource: ${req.params.resource}` });
    return null;
  }
  return resource;
}

// Express middleware-style handlers
async function list(req, res, next) {
  try {
    const resource = resolveResource(req, res);
    if (!resource) return;
    const result = await service.list(resource, req.user.school_id);
    res.status(200).json(result);
  } catch (e) { next(e); }
}

async function listAll(req, res, next) {
  try {
    const result = await service.listAll(req.user.school_id);
    res.status(200).json(result);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const resource = resolveResource(req, res);
    if (!resource) return;
    const result = await service.getById(resource, req.user.school_id, req.params.id);
    res.status(200).json(result);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const resource = resolveResource(req, res);
    if (!resource) return;
    const result = await service.create(resource, req.user.school_id, req.body || {});
    res.status(201).json(result);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const resource = resolveResource(req, res);
    if (!resource) return;
    const result = await service.update(resource, req.user.school_id, req.params.id, req.body || {});
    res.status(200).json(result);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const resource = resolveResource(req, res);
    if (!resource) return;
    const result = await service.remove(resource, req.user.school_id, req.params.id);
    res.status(200).json(result);
  } catch (e) { next(e); }
}

module.exports = { list, listAll, getById, create, update, remove };
