const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/summary').get(getSummary);

module.exports = router;