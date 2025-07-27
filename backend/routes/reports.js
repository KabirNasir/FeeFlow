const express = require('express');
const { getReports, createReport } = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

router.route('/')
    .get(getReports)
    .post(createReport);

module.exports = router;