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
  } catch (err) {
    // console.error('Create student error:', error.message);
    // res.status(500).json({ success: false, message: 'Failed to create student' });
    if (err.name === 'ValidationError') {
      const errors = Object.keys(err.errors).map(key => ({
        path: key,
        msg: err.errors[key].message
      }));
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: 'Failed to create student' });
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

// @desc    Get a single student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error('Get student by ID error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch student' });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error('Update student error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update student' });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    await student.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete student error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete student' });
  }
};