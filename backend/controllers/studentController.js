// backend/controllers/studentController.js

const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const FeeRecord = require('../models/FeeRecord');
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
    // if (email) {
    //   const existing = await Student.findOne({ email });
    //   if (existing) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Student with this email already exists'
    //     });
    //   }
    // }

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

    // --- THIS IS THE NEW LOGIC ---
    // 1. Find all enrollments for this student
    const enrollments = await Enrollment.find({ student: student._id });
    const enrollmentIds = enrollments.map(e => e._id);

    // 2. Delete all fee records associated with those enrollments
    await FeeRecord.deleteMany({ enrollment: { $in: enrollmentIds } });

    // 3. Delete all the enrollments
    await Enrollment.deleteMany({ student: student._id });
    
    // 4. Finally, delete the student
    await student.deleteOne();
    // --- END OF NEW LOGIC ---

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete student error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete student' });
  }
};

// exports.deleteStudent = async (req, res) => {
//   try {
//     const student = await Student.findOne({
//       _id: req.params.id,
//       createdBy: req.user.id,
//     });

//     if (!student) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Student not found' });
//     }

//     await student.deleteOne(); 
//     res.status(200).json({ success: true, data: {} });
//   } catch (error) {
//     console.error('Delete student error:', error.message);
//     res
//       .status(500)
//       .json({ success: false, message: 'Failed to delete student' });
//   }
// };

/**
 * @desc    Get a single student's complete profile
 * @route   GET /api/students/:id/profile
 * @access  Private
 */
exports.getStudentProfile = async (req, res) => {
  try {
    // 1. Find the student
    const student = await Student.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 2. Find all of that student's enrollments and populate the class details
    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate('class', 'name subject grade');

    // 3. Find all fee records associated with those enrollments
    const enrollmentIds = enrollments.map(e => e._id);
    const fees = await FeeRecord.find({ enrollment: { $in: enrollmentIds } })
      .sort({ dueDate: -1 });

    // 4. Combine all the data into a single profile object
    const profileData = {
      ...student.toObject(),
      enrollments,
      fees,
    };

    res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student profile' });
  }
};