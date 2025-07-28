// backend/routes/students.js

const express = require('express');
const {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    getStudentById,
    getStudentProfile
} = require('../controllers/studentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/').post(createStudent).get(getStudents);

router
    .route('/:id')
    .get(getStudentById)
    .put(updateStudent)
    .delete(deleteStudent);

router.route('/:id/profile').get(getStudentProfile);


module.exports = router;