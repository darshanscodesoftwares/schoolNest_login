const service = require('./subject-catalog.service');

const list = async (req, res, next) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const data = await service.list({ user: req.user, includeInactive });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { subject_name, order_number } = req.body || {};
    const data = await service.create({ user: req.user, subject_name, order_number });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { subject_name, order_number, is_active } = req.body || {};
    const data = await service.update({
      user: req.user,
      id: req.params.id,
      subject_name,
      order_number,
      is_active
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update };
