const repo = require('./class-templates.repository');

const list = async () => repo.listActive();

module.exports = { list };
