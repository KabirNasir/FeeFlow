// backend/controllers/classController.js

const Class = require('../models/Class');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private
exports.createClass = async (req, res) => {
    const { name, subject, grade, description, schedule, fees } = req.body;

    try {
        const newClass = await Class.create({
            name,
            subject,
            grade,
            description,
            schedule,
            fees,
            teacher: req.user.id  // FIXED: match schema
        });

        res.status(201).json({
            success: true,
            data: newClass
        });
    } catch (error) {
        console.error('Create class error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create class' });
    }
};

// @desc    Get all classes for the logged-in teacher
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id });  // FIXED
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Get classes error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch classes' });
    }
};

// @desc    Enroll an existing student in a class
// @route   POST /api/classes/:classId/enroll
// @access  Private
exports.enrollStudentInClass = async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;

    try {
        // Validate class
        const existingClass = await Class.findById(classId);
        if (!existingClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Validate student
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Check if already enrolled
        // const alreadyEnrolled = await Enrollment.findOne({ class: classId, student: studentId });
        // if (alreadyEnrolled) {
        //   return res.status(400).json({ success: false, message: 'Student is already enrolled in this class' });
        // }
        const existingEnrollment = await Enrollment.findOne({ class: classId, student: studentId });

        if (existingEnrollment) {
            if (existingEnrollment.status === 'active') {
                return res.status(400).json({ success: false, message: 'Student is already enrolled in this class' });
            }

            // Reactivate previous enrollment
            existingEnrollment.status = 'active';
            existingEnrollment.joinedOn = new Date(); // optional: reset join date
            await existingEnrollment.save();

            return res.status(200).json({
                success: true,
                message: 'Student re-enrolled successfully',
                data: existingEnrollment
            });
        }

        const enrollment = await Enrollment.create({ class: classId, student: studentId });

        res.status(201).json({
            success: true,
            data: { enrollment }
        });
    } catch (error) {
        console.error('Enroll student error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to enroll student' });
    }
};

// @desc    Get all students in a class
// @route   GET /api/classes/:classId/students
// @access  Private
exports.getStudentsInClass = async (req, res) => {
    const { classId } = req.params;

    try {
        const enrollments = await Enrollment.find({ class: classId }).populate('student');
        const students = enrollments.map(e => e.student);

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
};

// @desc    Unenroll a student from a class (soft delete)
// @route   PUT /api/classes/:classId/unenroll
// @access  Private
exports.unenrollStudentFromClass = async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;

    try {
        const enrollment = await Enrollment.findOne({ class: classId, student: studentId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        enrollment.status = 'inactive';
        await enrollment.save();

        res.status(200).json({
            success: true,
            message: 'Student successfully unenrolled',
            data: enrollment
        });
    } catch (error) {
        console.error('Unenroll error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to unenroll student' });
    }
};