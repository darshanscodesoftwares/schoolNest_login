const checkinService = require('./teacher.checkin.service');

const getTodayCheckinStatus = async (req, res, next) => {
  try {
    const result = await checkinService.getTodayCheckinStatus({ user: req.user });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const markCheckin = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const result = await checkinService.markCheckin({ user: req.user, latitude, longitude });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getTodayCheckinStatus, markCheckin };
