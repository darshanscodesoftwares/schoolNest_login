const leaveService = require('./parent.leave.service');

const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave({ user: req.user, body: req.body });
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

const getLeaveHistory = async (req, res, next) => {
  try {
    const history = await leaveService.getLeaveHistory({ user: req.user });
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyLeave, getLeaveHistory };
