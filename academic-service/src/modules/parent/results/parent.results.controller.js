const resultsService = require('./parent.results.service');

const getExamsList = async (req, res, next) => {
  try {
    const result = await resultsService.getExamsList({ user: req.user, params: req.params });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getResultDetail = async (req, res, next) => {
  try {
    const result = await resultsService.getResultDetail({ user: req.user, params: req.params });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExamsList, getResultDetail };
