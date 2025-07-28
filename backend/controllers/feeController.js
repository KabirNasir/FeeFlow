const Enrollment = require('../models/Enrollment');
const FeeRecord = require('../models/FeeRecord');
const Class = require('../models/Class');
const { generateFeesForMonth } = require('../services/feeService');
const sendEmail = require('../utils/sendEmail');

// @desc    Generate monthly fee records for active enrollments
// @route   POST /api/fees/generate
// @access  Private

exports.generateFees = async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Call the reusable service function
        const result = await generateFeesForMonth(month, year);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Generate fees API error:', error.message);
        res.status(500).json({ success: false, message: 'An unexpected error occurred' });
    }
  };

// exports.generateFees = async (req, res) => {
//     try {
//         const now = new Date();
//         const month = now.getMonth() + 1;
//         const year = now.getFullYear();

//         const enrollments = await Enrollment.find({ status: 'active' }).populate('class');
//         const newFees = [];

//         // Helper function: should we generate this month's fee for this frequency?
//         const shouldGenerate = (classFrequency, currentMonth) => {
//             if (classFrequency === 'monthly') return true;
//             if (classFrequency === 'quarterly') return [1, 4, 7, 10].includes(currentMonth);
//             if (classFrequency === 'yearly') return currentMonth === 1;
//             return false;
//         };

//         for (const enr of enrollments) {
//             const classFrequency = enr.class.fees.frequency || 'monthly';

//             // ⛔️ Skip if this class is not due for fee this month
//             if (!shouldGenerate(classFrequency, month)) continue;

//             // Check if already generated
//             const existing = await FeeRecord.findOne({
//                 enrollment: enr._id,
//                 'period.month': month,
//                 'period.year': year
//             });

//             if (!existing) {
//                 const dueDate = new Date(year, month - 1, enr.class.fees.dueDay || 1);

//                 const record = await FeeRecord.create({
//                     enrollment: enr._id,
//                     amount: enr.class.fees.amount,
//                     currency: enr.class.fees.currency,
//                     dueDate,
//                     period: { month, year }
//                 });

//                 newFees.push(record);
//             }
//         }

//         res.status(201).json({
//             success: true,
//             count: newFees.length,
//             data: newFees
//         });
//     } catch (error) {
//         console.error('Generate fees error:', error.message);
//         res.status(500).json({ success: false, message: 'Failed to generate fee records' });
//     }
// };

// @desc    Mark a fee record as paid or partially paid
// @route   PUT /api/fees/:feeId/pay
// @access  Private
// exports.markFeeAsPaid = async (req, res) => {
//     const { feeId } = req.params;
//     const { amountPaid, paymentId } = req.body;

//     try {
//         const fee = await FeeRecord.findById(feeId);
//         if (!fee) {
//             return res.status(404).json({ success: false, message: 'Fee record not found' });
//         }

//         fee.amountPaid += amountPaid;
//         fee.status = fee.amountPaid >= fee.amount ? 'paid' : 'partially_paid';
//         if (paymentId) fee.payment = paymentId;

//         await fee.save();

//         res.status(200).json({
//             success: true,
//             data: fee
//         });
//     } catch (error) {
//         console.error('Mark fee as paid error:', error.message);
//         res.status(500).json({ success: false, message: 'Failed to update payment' });
//     }
// };

exports.markFeeAsPaid = async (req, res) => {
    const { feeId } = req.params;
    const { amountPaid, paymentId } = req.body;

    try {
        const fee = await FeeRecord.findById(feeId);
        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        const remaining = fee.amount - fee.amountPaid;

        if (amountPaid > remaining) {
            return res.status(400).json({
                success: false,
                message: `Overpayment not allowed. You can only pay up to ₹${remaining}.`
            });
        }

        fee.amountPaid += amountPaid;
        fee.status = fee.amountPaid >= fee.amount ? 'paid' : 'partially_paid';
        if (paymentId) fee.payment = paymentId;

        await fee.save();

        res.status(200).json({
            success: true,
            data: fee
        });
    } catch (error) {
        console.error('Mark fee as paid error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update payment' });
    }
};

// @desc    Get all fee records for a class
// @route   GET /api/fees/class/:classId
// @access  Private
exports.getClassFees = async (req, res) => {
    const { classId } = req.params;

    try {
        const enrollments = await Enrollment.find({ class: classId });
        const enrollmentIds = enrollments.map(e => e._id);

        const fees = await FeeRecord.find({ enrollment: { $in: enrollmentIds } })
            .populate('enrollment');

        res.status(200).json({
            success: true,
            count: fees.length,
            data: fees
        });
    } catch (error) {
        console.error('Get class fees error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch class fee records' });
    }
};

// @desc    Get all fee records for a student
// @route   GET /api/fees/student/:studentId
// @access  Private
exports.getStudentFees = async (req, res) => {
    const { studentId } = req.params;

    try {
        const enrollments = await Enrollment.find({ student: studentId });
        const enrollmentIds = enrollments.map(e => e._id);

        const fees = await FeeRecord.find({ enrollment: { $in: enrollmentIds } })
            .populate('enrollment');

        res.status(200).json({
            success: true,
            count: fees.length,
            data: fees
        });
    } catch (error) {
        console.error('Get student fees error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch student fee records' });
    }
};



/**
* @desc    Get all fees with filtering
* @route   GET /api/fees
* @access  Private
*/
exports.getFees = async (req, res) => {
    try {
        const { classId, studentId, month, year } = req.query;

        // Start by finding all classes that belong to the logged-in teacher
        const userClasses = await Class.find({ teacher: req.user.id }).select('_id');
        const userClassIds = userClasses.map(c => c._id);

        // This is the base query. It ensures we only ever look at enrollments
        // in classes owned by the current user.
        let enrollmentQuery = { class: { $in: userClassIds } };

        // --- CORRECTED FILTER LOGIC ---
        // If a specific class is selected, ADD it to the query
        if (classId) {
            enrollmentQuery.class = classId;
        }
        // If a specific student is selected, ADD it to the query
        if (studentId) {
            enrollmentQuery.student = studentId;
        }

        const enrollments = await Enrollment.find(enrollmentQuery).select('_id');
        const enrollmentIds = enrollments.map(e => e._id);

        // Now, build the query for the fees based on the filtered enrollments
        let feeQuery = { enrollment: { $in: enrollmentIds } };

        if (month) {
            feeQuery['period.month'] = parseInt(month, 10);
        }
        if (year) {
            feeQuery['period.year'] = parseInt(year, 10);
        }

        const fees = await FeeRecord.find(feeQuery)
            .populate({
                path: 'enrollment',
                populate: [
                    { path: 'student', select: 'name' },
                    { path: 'class', select: 'name' }
                ]
            })
            .sort({ dueDate: -1 });

        res.status(200).json({ success: true, count: fees.length, data: fees });

    } catch (error) {
        console.error("Get fees error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch fees' });
    }
  };







// @desc    Generate monthly fee records for active enrollments
// @route   POST /api/fees/generate
// @access  Private
// exports.generateMonthlyFees = async (req, res) => {
//     try {
//         const now = new Date();
//         const month = now.getMonth() + 1;
//         const year = now.getFullYear();

//         const enrollments = await Enrollment.find({ status: 'active' }).populate('class');
//         const newFees = [];

//         for (const enr of enrollments) {
//             const existing = await FeeRecord.findOne({
//                 enrollment: enr._id,
//                 'period.month': month,
//                 'period.year': year
//             });
//             const shouldGenerate = (classFrequency, currentMonth) => {
//                 if (classFrequency === 'monthly') return true;
//                 if (classFrequency === 'quarterly') return [1, 4, 7, 10].includes(currentMonth);
//                 if (classFrequency === 'yearly') return currentMonth === 1;
//                 return false;
//             };
//             if (!existing) {
//                 const dueDate = new Date(year, month - 1, enr.class.fees.dueDay || 1);

//                 const record = await FeeRecord.create({
//                     enrollment: enr._id,
//                     amount: enr.class.fees.amount,
//                     currency: enr.class.fees.currency,
//                     dueDate,
//                     period: { month, year }
//                 });

//                 newFees.push(record);
//             }
//         }

//         res.status(201).json({
//             success: true,
//             count: newFees.length,
//             data: newFees
//         });
//     } catch (error) {
//         console.error('Generate fees error:', error.message);
//         res.status(500).json({ success: false, message: 'Failed to generate fee records' });
//     }
// };

/**
 * @desc    Send a manual fee reminder email
 * @route   POST /api/fees/:feeId/remind
 * @access  Private
 */
exports.sendManualReminder = async (req, res) => {
    try {
        const fee = await FeeRecord.findById(req.params.feeId)
            .populate({
                path: 'enrollment',
                populate: [
                    { path: 'student', select: 'name parentInfo' },
                    { path: 'class', select: 'name' }
                ]
            });

        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        const { parentInfo } = fee.enrollment.student;
        if (!parentInfo || !parentInfo.email) {
            return res.status(400).json({ success: false, message: 'Parent email not found for this student.' });
        }

        const amountDue = fee.amount - fee.amountPaid;
        const message = `
        Dear ${parentInfo.name},
        This is a friendly reminder regarding the fee for ${fee.enrollment.student.name}'s enrollment in the class "${fee.enrollment.class.name}".
        Amount Due: ₹${amountDue}
        Due Date: ${fee.dueDate.toLocaleDateString()}
        Thank you.
      `;

        await sendEmail({
            email: parentInfo.email,
            subject: `Fee Reminder for ${fee.enrollment.student.name}`,
            message
        });

        // Log that a reminder was sent
        fee.remindersSent.push({ status: 'sent' });
        await fee.save();

        res.status(200).json({ success: true, message: 'Reminder email sent successfully' });

    } catch (error) {
        console.error("Send manual reminder error:", error);
        res.status(500).json({ success: false, message: 'Failed to send reminder' });
    }
  };