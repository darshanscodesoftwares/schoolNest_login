const feesService = require('./parent.fees.service');

const getFeesSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const result = await feesService.getFeesSummary({
      user: req.user,
      studentId
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const result = await feesService.getPaymentHistory({
      user: req.user,
      studentId
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

const dummyPayFee = async (req, res, next) => {
  try {
    const { studentId, feeId } = req.params;
    const result = await feesService.dummyPayFee({
      user: req.user,
      studentId,
      feeId
    });
    return res.status(200).json({ success: true, message: 'Payment recorded (dummy)', ...result });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getFeesSummary, getPaymentHistory, dummyPayFee };
