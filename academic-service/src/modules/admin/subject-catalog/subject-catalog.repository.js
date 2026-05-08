const pool = require('../../../config/db');

const listActive = async () => {
  const { rows } = await pool.query(
    `SELECT id, subject_name, order_number, is_active
     FROM subject_catalog
     WHERE is_active = TRUE
     ORDER BY order_number ASC, subject_name ASC`
  );
  return rows;
};

const listAll = async () => {
  const { rows } = await pool.query(
    `SELECT id, subject_name, order_number, is_active
     FROM subject_catalog
     ORDER BY order_number ASC, subject_name ASC`
  );
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, subject_name, order_number, is_active FROM subject_catalog WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ subject_name, order_number }) => {
  const { rows } = await pool.query(
    `INSERT INTO subject_catalog (subject_name, order_number)
     VALUES ($1, COALESCE($2, 0))
     RETURNING id, subject_name, order_number, is_active`,
    [subject_name, order_number]
  );
  return rows[0];
};

const update = async (id, { subject_name, order_number, is_active }) => {
  const { rows } = await pool.query(
    `UPDATE subject_catalog
     SET subject_name = COALESCE($2, subject_name),
         order_number = COALESCE($3, order_number),
         is_active    = COALESCE($4, is_active),
         updated_at   = NOW()
     WHERE id = $1
     RETURNING id, subject_name, order_number, is_active`,
    [id, subject_name, order_number, is_active]
  );
  return rows[0] || null;
};

module.exports = { listActive, listAll, getById, create, update };
