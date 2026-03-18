const leaveService = require('./teacher.leave.service');

const getLeaveRequests = async (req, res, next) => {
  try {
    const result = await leaveService.getLeaveRequests({ user: req.user, query: req.query });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const updated = await leaveService.updateLeaveStatus({ user: req.user, params: req.params, body: req.body });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaveRequests, updateLeaveStatus };
