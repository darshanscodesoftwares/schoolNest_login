const express = require('express');
const {
  adminLogin,
  teacherLogin,
  parentLogin,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/teacher/login', teacherLogin);
router.post('/parent/login', parentLogin);

module.exports = router;
