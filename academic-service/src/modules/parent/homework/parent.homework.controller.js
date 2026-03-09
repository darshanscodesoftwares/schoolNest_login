const homeworkService = require('./parent.homework.service');

const getHomework = async (req, res, next) => {
  try {
    const { tab } = req.query;

    const result = await homeworkService.getHomework({
      user: req.user,
      tab
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getHomework };
