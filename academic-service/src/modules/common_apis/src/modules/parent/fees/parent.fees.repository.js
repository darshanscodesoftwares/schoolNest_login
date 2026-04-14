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

module.exports = { getStudentFees, getPaymentHistory };
