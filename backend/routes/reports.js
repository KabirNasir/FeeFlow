const express = require('express');
const { getReports, createReport, getReportById, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

router.route('/')
    .get(getReports)
    .post(createReport);

router.route('/:id').get(getReportById).delete(deleteReport);
module.exports = router;