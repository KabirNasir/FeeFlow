// backend/controllers/studentController.js

const Student = require('../models/Student');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res) => {
  const { name, email, phone, parentInfo  } = req.body;

  try {
    // Validate required student and parent fields
    if (!name || !parentInfo?.name || !parentInfo?.email || !parentInfo?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required student or parent information'
      });
    }

    // Optional: Prevent duplicate student by email
    if (email) {
      const existing = await Student.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email already exists'
        });
      }
    }

    const student = await Student.create({
      name,
      email,
      phone,
      parentInfo,
      createdBy: req.user.id 
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error('Create student error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create student' });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ createdBy: req.user.id });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Get students error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};
