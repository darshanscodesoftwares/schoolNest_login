const homeworkService = require('./teacher.homework.service');

const createHomework = async (req, res, next) => {
  try {
    const {
      class_id: classId,
      subject,
      title,
      description,
      due_date: dueDate,
      attachment_url: attachmentUrl
    } = req.body;

    const result = await homeworkService.createHomework({
      user: req.user,
      classId,
      subject,
      title,
      description,
      dueDate,
      attachmentUrl
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

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

// Called from timetable class detail screen
const getHomeworkByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { tab } = req.query;

    const result = await homeworkService.getHomeworkByClass({
      user: req.user,
      classId,
      tab
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createHomework,
  getHomework,
  getHomeworkByClass
};
