const homeworkService = require('./parent.homework.service');

const getHomework = async (req, res, next) => {
  try {
    const { tab, student_id } = req.query;

    const result = await homeworkService.getHomework({
      user: req.user,
      tab,
      studentId: student_id
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getHomework };
