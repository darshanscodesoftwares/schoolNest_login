// common-db.js — adapter that points to academic_db
// All former common-api tables (school_classes, departments, blood_groups, etc.)
// now live in academic_db. This export lets jerin's modules require('../config/common-db')
// without modification — they query the same pool as the rest of academic-service.

const pool = require('./db');
module.exports = pool;
