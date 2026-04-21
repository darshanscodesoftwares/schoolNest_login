const feesRepository = require('./parent.fees.repository');
const parentAttendanceRepo = require('../attendance/parent.attendance.repository');

const assertParentRole = (user) => {
  if (!user || user.role !== 'PARENT') {
    const error = new Error('Forbidden: only parents can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const assertStudentOwnership = async (studentId, user) => {
  const student = await parentAttendanceRepo.verifyStudentBelongsToParent({
    studentId,
    parentId: user.user_id,
    schoolId: user.school_id
  });
  if (!student) {
    const error = new Error('Parent not authorized for this student');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const getFeesSummary = async ({ user, studentId }) => {
  assertParentRole(user);
  await assertStudentOwnership(studentId, user);

  const fees = await feesRepository.getStudentFees({
    schoolId: user.school_id,
    studentId
  });

  const totalFee = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const paid = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + Number(f.amount), 0);
  const remaining = totalFee - paid;

  const feeDetails = fees.map(f => ({
    id: f.id,
    fee_name: f.fee_name,
    icon: f.icon,
    amount: Number(f.amount),
    due_date: f.due_date,
    status: f.status,
    paid_at: f.paid_at
  }));

  return {
    summary: { total_fee: totalFee, paid, remaining },
    fees: feeDetails
  };
};

const getPaymentHistory = async ({ user, studentId }) => {
  assertParentRole(user);
  await assertStudentOwnership(studentId, user);

  const payments = await feesRepository.getPaymentHistory({
    schoolId: user.school_id,
    studentId
  });

  return {
    payments: payments.map(p => ({
      id: p.id,
      fee_name: p.fee_name,
      amount: Number(p.amount),
      method: p.method,
      transaction_id: p.transaction_id,
      status: p.status,
      paid_at: p.paid_at
    }))
  };
};

// Dev-only dummy payment — flips fee to PAID and records a payment row.
// No gateway call, no settlement — intended for mobile dev until a real
// payment gateway (Razorpay / Cashfree / etc.) is wired in.
const dummyPayFee = async ({ user, studentId, feeId }) => {
  assertParentRole(user);
  await assertStudentOwnership(studentId, user);

  const fee = await feesRepository.getFeeForStudent({
    schoolId: user.school_id,
    studentId,
    feeId
  });
  if (!fee) {
    const err = new Error('Fee not found for this student');
    err.statusCode = 404; err.code = 'FEE_NOT_FOUND';
    throw err;
  }
  if (fee.status === 'PAID') {
    const err = new Error('Fee is already paid');
    err.statusCode = 409; err.code = 'FEE_ALREADY_PAID';
    throw err;
  }

  const transactionId = 'DUMMY' + Date.now() + Math.floor(Math.random() * 1000);

  const { fee: updated, payment } = await feesRepository.markFeePaidTxn({
    schoolId:     user.school_id,
    studentId,
    feeId,
    amount:       fee.amount,
    method:       'UPI',
    transactionId
  });

  return {
    fee: {
      id:        updated.id,
      fee_name:  fee.fee_name,
      icon:      fee.icon,
      amount:    Number(updated.amount),
      status:    updated.status,
      paid_at:   updated.paid_at
    },
    payment: {
      id:             payment.id,
      amount:         Number(payment.amount),
      method:         payment.method,
      transaction_id: payment.transaction_id,
      status:         payment.status,
      paid_at:        payment.paid_at
    }
  };
};

module.exports = { getFeesSummary, getPaymentHistory, dummyPayFee };
