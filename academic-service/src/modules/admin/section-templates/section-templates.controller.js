const svc = require('./section-templates.service');

const assertAdmin = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const err = new Error('Forbidden: admins only');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
};

const list = async (req, res, next) => {
  try {
    assertAdmin(req.user);
    const data = await svc.list();
    return res.status(200).json({ success: true, data });
  } catch (e) { return next(e); }
};

module.exports = { list };
