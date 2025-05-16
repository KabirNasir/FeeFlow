// backend/routes/classes.js

const express = require('express');
const {
  createClass,
  getClasses,
  enrollStudentInClass,  
  getStudentsInClass,
  unenrollStudentFromClass,
  generateFees,
  getFeesForClass
} = require('../controllers/classController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

// Apply protection to all routes in this file
router.use(protect);

// Create a new class
router.post('/', createClass);

// Get all classes for the logged-in teacher
router.get('/', getClasses);

// Enroll an existing student into a class
router.post('/:classId/enroll', enrollStudentInClass);

// Get all students in a class
router.get('/:classId/students', getStudentsInClass);

router.put('/:classId/unenroll', unenrollStudentFromClass);

router.post('/:classId/generate-fees', generateFees);

router.get('/:classId/fees', getFeesForClass);

module.exports = router;
