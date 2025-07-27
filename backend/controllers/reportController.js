const Report = require('../models/Report');
// const Fee = require('../models/Fee');
const Fee = require('../models/FeeRecord');

/**
 * @desc    Get all reports
 * @route   GET /api/reports
 * @access  Private
 */
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ generatedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};

/**
 * @desc    Create a new report
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res) => {
    req.body.generatedBy = req.user.id;

    try {
        // For this example, we will generate a simple fee collection report
        const fees = await Fee.find({ 'teacher': req.user.id })
            .populate('enrollment.student', 'name');

        const totalCollected = fees.reduce((acc, fee) => acc + fee.amountPaid, 0);
        const totalDue = fees.reduce((acc, fee) => acc + fee.amount, 0);
        const outstanding = totalDue - totalCollected;

        const reportData = {
            title: req.body.title || `Fee Collection Summary - ${new Date().toLocaleDateString()}`,
            reportType: 'fee_collection',
            data: {
                totalCollected,
                totalDue,
                outstanding,
                numberOfFees: fees.length,
                feeDetails: fees.map(f => ({
                    studentName: f.enrollment.student.name,
                    status: f.status,
                    amountPaid: f.amountPaid,
                    amountDue: f.amount,
                    dueDate: f.dueDate,
                })),
            },
            generatedBy: req.user.id,
        };

        const report = await Report.create(reportData);

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ success: false, message: 'Failed to create report' });
    }
};