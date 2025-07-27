const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const Fee = require('../models/FeeRecord');
const Student = require('../models/Student');

/**
 * @desc    Get dashboard summary data
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get student and class counts
        const totalStudents = await Student.countDocuments({ createdBy: userId });
        const totalClasses = await Class.countDocuments({ teacher: userId });

        // Calculate financial summary
        const userClasses = await Class.find({ teacher: userId }).select('_id');
        const classIds = userClasses.map(c => c._id);

        const enrollments = await Enrollment.find({ class: { $in: classIds } }).select('_id');
        const enrollmentIds = enrollments.map(e => e._id);

        const fees = await Fee.find({ enrollment: { $in: enrollmentIds } });

        const totalPaid = fees.reduce((acc, fee) => acc + fee.amountPaid, 0);
        const totalDue = fees.reduce((acc, fee) => acc + fee.amount, 0);
        const totalOutstanding = totalDue - totalPaid;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalClasses,
                totalPaid,
                totalOutstanding,
            },
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
    }
};