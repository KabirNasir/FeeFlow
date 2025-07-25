// backend/controllers/classController.js

const Class = require('../models/Class');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const FeeRecord = require('../models/FeeRecord'); 
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
// exports.getStudentsInClass = async (req, res) => {
//     const { classId } = req.params;

//     try {
//         const enrollments = await Enrollment.find({ class: classId, status: 'active' }).populate('student');
//         const students = enrollments.map(e => e.student);

//         res.status(200).json({
//             success: true,
//             data: students
//         });
//     } catch (error) {
//         console.error('Get students error:', error.message);
//         res.status(500).json({ success: false, message: 'Failed to fetch students' });
//     }
// };

exports.getStudentsInClass = async (req, res) => {
    const { classId } = req.params;

    try {
        // Fetch all enrollments for this class
        const enrollments = await Enrollment.find({ class: classId })
            .populate('student');

        // Map to include student info and status
        const students = enrollments.map(e => ({
            ...e.student.toObject(),
            enrollmentStatus: e.status
        }));

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

// exports.generateFees = async (req, res) => {
//     const { classId } = req.params;

//     try {
//         // find all *active* enrollments in this class
//         const enrollments = await Enrollment.find({
//             class: classId,
//             status: 'active'
//         }).populate('class');

//         const now = new Date();
//         const month = now.getMonth() + 1;
//         const year = now.getFullYear();

//         const newRecords = [];

//         // helper to decide for quarterly/yearly
//         const shouldGenerate = (freq, m) => {
//             if (freq === 'monthly') return true;
//             if (freq === 'quarterly') return [1, 4, 7, 10].includes(m);
//             if (freq === 'yearly') return m === 1;
//             return false;
//         };

//         for (let enr of enrollments) {
//             // skip if already generated
//             const exists = await FeeRecord.findOne({
//                 enrollment: enr._id,
//                 'period.month': month,
//                 'period.year': year
//             });
//             if (exists) continue;

//             // only generate if frequency matches
//             if (!shouldGenerate(enr.class.fees.frequency, month)) continue;

//             const dueDay = enr.class.fees.dueDay || 1;
//             const dueDate = new Date(year, month - 1, dueDay);

//             const record = await FeeRecord.create({
//                 enrollment: enr._id,
//                 amount: enr.class.fees.amount,
//                 currency: enr.class.fees.currency,
//                 dueDate,
//                 period: { month, year }
//             });

//             newRecords.push(record);
//         }

//         res.status(201).json({
//             success: true,
//             count: newRecords.length,
//             data: newRecords
//         });
//     } catch (err) {
//         console.error('Generate fees error:', err);
//         res.status(500).json({ success: false, message: 'Failed to generate fees' });
//     }
// };


// backend/controllers/classController.js

exports.generateFees = async (req, res) => {
    const { classId } = req.params;

    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // only look at active enrollments for this class
        const enrollments = await Enrollment.find({
            class: classId,
            status: 'active'
        }).populate('class');

        const newFees = [];

        // should we generate this month?
        const shouldGenerate = (frequency, m) => {
            if (frequency === 'monthly') return true;
            if (frequency === 'quarterly') return [1, 4, 7, 10].includes(m);
            if (frequency === 'yearly') return m === 1;
            return false;
        };

        for (const enr of enrollments) {
            const classFrequency = enr.class.fees.frequency || 'monthly';

            // skip if this class isn’t due this month
            if (!shouldGenerate(classFrequency, month)) continue;

            // skip if already generated
            const exists = await FeeRecord.findOne({
                enrollment: enr._id,
                'period.month': month,
                'period.year': year
            });
            if (exists) continue;

            const dueDay = enr.class.fees.dueDay || 1;
            const dueDate = new Date(year, month - 1, dueDay);

            const record = await FeeRecord.create({
                enrollment: enr._id,
                amount: enr.class.fees.amount,
                currency: enr.class.fees.currency,
                dueDate,
                period: { month, year }
            });

            newFees.push(record);
        }

        return res.status(201).json({
            success: true,
            count: newFees.length,
            data: newFees
        });
    } catch (error) {
        console.error('Generate fees error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate fee records'
        });
    }
};


/**
 * @desc    List all fee records for a given class
 * @route   GET /api/classes/:classId/fees
 * @access  Private
 */
exports.getFeesForClass = async (req, res) => {
    const { classId } = req.params;

    try {
        // 1) find all enrollment IDs for this class
        const enrollments = await Enrollment.find({ class: classId }).select('_id');
        const enrollmentIds = enrollments.map(e => e._id);

        // 2) fetch all FeeRecords whose enrollment is in that list
        const fees = await FeeRecord
            .find({ enrollment: { $in: enrollmentIds } })
            .populate({
                path: 'enrollment',
                populate: { path: 'student', select: 'name' }
            });

        return res.status(200).json({
            success: true,
            count: fees.length,
            data: fees
        });
    } catch (err) {
        console.error('Get fees error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch fee records'
        });
    }
};

// @desc    Get a single class’s details (for breadcrumbs, etc.)
// @route   GET /api/classes/:classId
// @access  Private
exports.getClassById = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.classId);
        if (!cls) {
            return res
                .status(404)
                .json({ success: false, message: 'Class not found' });
        }
        res.status(200).json({ success: true, data: cls });
    } catch (error) {
        console.error('Get class by ID error:', error.message);
        res
            .status(500)
            .json({ success: false, message: 'Failed to fetch class details' });
    }
};

// @desc    Update a class
// @route   PUT /api/classes/:classId
// @access  Private
exports.updateClass = async (req, res) => {
    try {
        let course = await Class.findById(req.params.classId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Make sure user is the class owner
        if (course.teacher.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        course = await Class.findByIdAndUpdate(req.params.classId, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({ success: false, message: 'Failed to update class' });
    }
  };