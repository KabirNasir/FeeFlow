// backend/routes/fees.js

const express = require('express');
const {
    generateFees,
    markFeeAsPaid,
    getClassFees,
    getStudentFees,
    getFees
} = require('../controllers/feeController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All routes below require authentication
router.use(protect);

// 1. Generate fee records for all active enrollments (monthly run)
router.post('/generate', generateFees);

// 2. Mark a specific fee record as paid
router.put('/:feeId/pay', markFeeAsPaid);

// 3. Get all fee records for a class
router.get('/class/:classId', getClassFees);

// 4. Get all fee records for a student
router.get('/student/:studentId', getStudentFees);

router.route('/').get(getFees); 


module.exports = router;
