const express = require('express');
const { createStudent, getStudents } = require('../controllers/studentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, createStudent);
router.get('/', protect, getStudents);

module.exports = router;
