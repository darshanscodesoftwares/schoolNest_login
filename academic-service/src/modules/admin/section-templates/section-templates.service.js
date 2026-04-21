const repo = require('./section-templates.repository');

const list = async () => repo.listActive();

module.exports = { list };
