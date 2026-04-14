const pool = require('../../../config/db');

function buildOrderClause(resource) {
  return resource.hasOrder
    ? `ORDER BY order_number ASC, ${resource.nameColumn} ASC`
    : `ORDER BY ${resource.nameColumn} ASC`;
}

async function list(resource, schoolId) {
  let sql = `SELECT * FROM ${resource.table}`;
  const params = [];
  if (resource.tenantScoped) {
    sql += ` WHERE school_id = $1`;
    params.push(schoolId);
  }
  sql += ` ${buildOrderClause(resource)}`;
  const result = await pool.query(sql, params);
  return result.rows;
}

async function getById(resource, schoolId, id) {
  let sql = `SELECT * FROM ${resource.table} WHERE id = $1`;
  const params = [id];
  if (resource.tenantScoped) {
    sql += ` AND school_id = $2`;
    params.push(schoolId);
  }
  sql += ` LIMIT 1`;
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function create(resource, schoolId, name, orderNumber) {
  const cols = [resource.nameColumn];
  const vals = [name];
  if (resource.tenantScoped) {
    cols.unshift('school_id');
    vals.unshift(schoolId);
  }
  if (resource.hasOrder) {
    cols.push('order_number');
    vals.push(orderNumber == null ? 0 : orderNumber);
  }
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${resource.table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(sql, vals);
  return result.rows[0];
}

async function update(resource, schoolId, id, name, orderNumber) {
  const sets = [];
  const params = [];
  if (name !== undefined) {
    params.push(name);
    sets.push(`${resource.nameColumn} = $${params.length}`);
  }
  if (resource.hasOrder && orderNumber !== undefined) {
    params.push(orderNumber);
    sets.push(`order_number = $${params.length}`);
  }
  if (sets.length === 0) {
    return await getById(resource, schoolId, id);
  }
  params.push(id);
  let sql = `UPDATE ${resource.table} SET ${sets.join(', ')} WHERE id = $${params.length}`;
  if (resource.tenantScoped) {
    params.push(schoolId);
    sql += ` AND school_id = $${params.length}`;
  }
  sql += ` RETURNING *`;
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function remove(resource, schoolId, id) {
  let sql = `DELETE FROM ${resource.table} WHERE id = $1`;
  const params = [id];
  if (resource.tenantScoped) {
    sql += ` AND school_id = $2`;
    params.push(schoolId);
  }
  sql += ` RETURNING id`;
  const result = await pool.query(sql, params);
  return result.rowCount > 0;
}

module.exports = { list, getById, create, update, remove };
