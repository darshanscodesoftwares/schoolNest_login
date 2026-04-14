const examService = require('./teacher.exam.service');

const getExams = async (req, res, next) => {
  try {
    const exams = await examService.getExams({ user: req.user, query: req.query });
    res.status(200).json({ success: true, data: exams });
  } catch (err) {
    next(err);
  }
};

const getMarksEntry = async (req, res, next) => {
  try {
    const result = await examService.getMarksEntry({ user: req.user, params: req.params });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const saveMarks = async (req, res, next) => {
  try {
    const result = await examService.saveMarks({ user: req.user, params: req.params, body: req.body });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExams, getMarksEntry, saveMarks };
