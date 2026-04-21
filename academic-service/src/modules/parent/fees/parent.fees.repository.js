const pool = require('../../../config/db');

const getStudentFees = async ({ schoolId, studentId }) => {
  const query = {
    text: `SELECT sf.id, sf.amount, sf.due_date, sf.status, sf.paid_at,
                  fc.name AS fee_name, fc.icon
           FROM student_fees sf
           JOIN fee_categories fc ON fc.id = sf.fee_category_id
           WHERE sf.school_id = $1 AND sf.student_id = $2
           ORDER BY sf.due_date ASC`,
    values: [schoolId, studentId]
  };
  const { rows } = await pool.query(query);
  return rows;
};

const getPaymentHistory = async ({ schoolId, studentId }) => {
  const query = {
    text: `SELECT p.id, p.amount, p.method, p.transaction_id, p.status, p.paid_at,
                  fc.name AS fee_name
           FROM payments p
           JOIN student_fees sf ON sf.id = p.student_fee_id
           JOIN fee_categories fc ON fc.id = sf.fee_category_id
           WHERE p.school_id = $1 AND p.student_id = $2
           ORDER BY p.paid_at DESC`,
    values: [schoolId, studentId]
  };
  const { rows } = await pool.query(query);
  return rows;
};

const getFeeForStudent = async ({ schoolId, studentId, feeId }) => {
  const { rows } = await pool.query({
    text: `SELECT sf.id, sf.amount, sf.status, sf.paid_at, fc.name AS fee_name, fc.icon
           FROM student_fees sf
           JOIN fee_categories fc ON fc.id = sf.fee_category_id
           WHERE sf.school_id = $1 AND sf.student_id = $2 AND sf.id = $3`,
    values: [schoolId, studentId, feeId]
  });
  return rows[0] || null;
};

const markFeePaidTxn = async ({ schoolId, studentId, feeId, amount, method, transactionId }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const upd = await client.query({
      text: `UPDATE student_fees
             SET status = 'PAID', paid_at = NOW()
             WHERE school_id = $1 AND student_id = $2 AND id = $3 AND status <> 'PAID'
             RETURNING id, amount, status, paid_at`,
      values: [schoolId, studentId, feeId]
    });
    if (upd.rowCount === 0) {
      await client.query('ROLLBACK');
      const err = new Error('Fee is already paid');
      err.statusCode = 409; err.code = 'FEE_ALREADY_PAID';
      throw err;
    }

    const pay = await client.query({
      text: `INSERT INTO payments (school_id, student_id, student_fee_id, amount, method, transaction_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'PAID')
             RETURNING id, amount, method, transaction_id, status, paid_at`,
      values: [schoolId, studentId, feeId, amount, method, transactionId]
    });

    await client.query('COMMIT');
    return { fee: upd.rows[0], payment: pay.rows[0] };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) { /* noop */ }
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getStudentFees, getPaymentHistory, getFeeForStudent, markFeePaidTxn };
