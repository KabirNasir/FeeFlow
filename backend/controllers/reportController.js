const Report = require('../models/Report');
// const Fee = require('../models/Fee');
const Fee = require('../models/FeeRecord');
const Class = require('../models/Class'); 
const Enrollment = require('../models/Enrollment');
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

// /**
//  * @desc    Create a new report
//  * @route   POST /api/reports
//  * @access  Private
//  */
// exports.createReport = async (req, res) => {
//     req.body.generatedBy = req.user.id;

//     try {
//         // For this example, we will generate a simple fee collection report
//         const fees = await Fee.find({ 'teacher': req.user.id })
//             .populate('enrollment.student', 'name');

//         const totalCollected = fees.reduce((acc, fee) => acc + fee.amountPaid, 0);
//         const totalDue = fees.reduce((acc, fee) => acc + fee.amount, 0);
//         const outstanding = totalDue - totalCollected;

//         const reportData = {
//             title: req.body.title || `Fee Collection Summary - ${new Date().toLocaleDateString()}`,
//             reportType: 'fee_collection',
//             data: {
//                 totalCollected,
//                 totalDue,
//                 outstanding,
//                 numberOfFees: fees.length,
//                 feeDetails: fees.map(f => ({
//                     studentName: f.enrollment.student.name,
//                     status: f.status,
//                     amountPaid: f.amountPaid,
//                     amountDue: f.amount,
//                     dueDate: f.dueDate,
//                 })),
//             },
//             generatedBy: req.user.id,
//         };

//         const report = await Report.create(reportData);

//         res.status(201).json({ success: true, data: report });
//     } catch (error) {
//         console.error('Create report error:', error);
//         res.status(500).json({ success: false, message: 'Failed to create report' });
//     }
// };


// /**
//  * @desc    Create a new report
//  * @route   POST /api/reports
//  * @access  Private
//  */
// exports.createReport = async (req, res) => {
//     try {
//         // 1. Find all classes taught by the current user
//         const userClasses = await Class.find({ teacher: req.user.id });
//         if (userClasses.length === 0) {
//             return res.status(400).json({ success: false, message: 'You have no classes to generate a report for.' });
//         }
//         const classIds = userClasses.map(c => c._id);

//         // 2. Find all fees associated with those classes
//         const fees = await Fee.find({ classId: { $in: classIds } })
//             .populate({
//                 path: 'enrollment',
//                 populate: {
//                     path: 'student',
//                     select: 'name'
//                 }
//             });

//         // 3. Perform calculations
//         const totalCollected = fees.reduce((acc, fee) => acc + fee.amountPaid, 0);
//         const totalDue = fees.reduce((acc, fee) => acc + fee.amount, 0);
//         const outstanding = totalDue - totalCollected;

//         // 4. Structure the report data
//         const reportData = {
//             title: req.body.title || `Fee Collection Summary - ${new Date().toLocaleDateString()}`,
//             reportType: 'fee_collection',
//             data: {
//                 totalCollected,
//                 totalDue,
//                 outstanding,
//                 numberOfFees: fees.length,
//                 feeDetails: fees.map(f => ({
//                     studentName: f.enrollment?.student?.name || 'N/A', // Safer access
//                     status: f.status,
//                     amountPaid: f.amountPaid,
//                     amountDue: f.amount,
//                     dueDate: f.dueDate,
//                 })),
//             },
//             generatedBy: req.user.id,
//         };

//         const report = await Report.create(reportData);
//         res.status(201).json({ success: true, data: report });

//     } catch (error) {
//         console.error('Create report error:', error);
//         res.status(500).json({ success: false, message: 'Failed to create report' });
//     }
//   };

/**
 * @desc    Create a new report
 * @route   POST /api/reports
 * @access  Private
  */
exports.createReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 1. Find all fees for the user's classes by chaining queries
        const userClasses = await Class.find({ teacher: userId }).select('_id name');
        const classIds = userClasses.map(c => c._id);

        const enrollments = await Enrollment.find({ class: { $in: classIds } }).select('_id student class');
        const enrollmentIds = enrollments.map(e => e._id);

        const fees = await Fee.find({ enrollment: { $in: enrollmentIds } })
            .populate({
                path: 'enrollment',
                select: 'student class',
                populate: {
                    path: 'student',
                    select: 'name'
                }
            });

        // 2. Process and aggregate the data
        let totalCollected = 0;
        let totalDue = 0;
        const summary = {}; // Use an object to group data

        for (const fee of fees) {
            if (!fee.enrollment || !fee.enrollment.student) continue;

            totalCollected += fee.amountPaid;
            totalDue += fee.amount;

            const classId = fee.enrollment.class.toString();
            const studentId = fee.enrollment.student._id.toString();
            const className = userClasses.find(c => c._id.toString() === classId)?.name || 'Unknown Class';

            // Initialize class summary if it doesn't exist
            if (!summary[classId]) {
                summary[classId] = {
                    className,
                    classTotalCollected: 0,
                    classTotalDue: 0,
                    studentSummaries: {}
                };
            }

            // Initialize student summary if it doesn't exist
            if (!summary[classId].studentSummaries[studentId]) {
                summary[classId].studentSummaries[studentId] = {
                    studentName: fee.enrollment.student.name,
                    studentTotalPaid: 0,
                    studentTotalDue: 0,
                    fees: []
                };
            }

            // Aggregate data
            summary[classId].classTotalCollected += fee.amountPaid;
            summary[classId].classTotalDue += fee.amount;
            summary[classId].studentSummaries[studentId].studentTotalPaid += fee.amountPaid;
            summary[classId].studentSummaries[studentId].studentTotalDue += fee.amount;
            summary[classId].studentSummaries[studentId].fees.push({
                period: `${fee.period.month}/${fee.period.year}`,
                status: fee.status,
                amount: fee.amount,
                amountPaid: fee.amountPaid,
                dueDate: fee.dueDate
            });
        }

        // Convert the summary object into the array structure the frontend expects
        const summaryByClass = Object.values(summary).map(classData => ({
            ...classData,
            studentSummaries: Object.values(classData.studentSummaries)
        }));

        const reportPayload = {
            title: req.body.title || `Monthly Fee Summary - ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
            reportType: 'fee_collection',
            generatedBy: userId,
            data: {
                totalCollected,
                totalDue,
                outstanding: totalDue - totalCollected,
                summaryByClass
            },
            createdAt: now
        };

        const updatedReport = await Report.findOneAndUpdate(
            {
                generatedBy: userId,
                reportType: 'fee_collection',
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            },
            { $set: reportPayload }, // Use $set to avoid overwriting the _id
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ success: true, data: updatedReport });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ success: false, message: 'Failed to create report' });
    }
  };

// exports.createReport = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const now = new Date();
//         const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//         const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//         // 1. Find classes and their corresponding enrollments and fees
//         const userClasses = await Class.find({ teacher: userId });
//         if (userClasses.length === 0) {
//             return res.status(400).json({ success: false, message: 'No classes found to generate a report.' });
//         }
//         const classIds = userClasses.map(c => c._id);
//         const enrollments = await Enrollment.find({ class: { $in: classIds } }).populate('student', 'name');
//         const enrollmentIds = enrollments.map(e => e._id);
//         const fees = await Fee.find({ enrollment: { $in: enrollmentIds } });

//         // 2. Process and group the data
//         const classMap = new Map();
//         userClasses.forEach(c => classMap.set(c._id.toString(), {
//             className: c.name,
//             studentSummaries: new Map(),
//             classTotalCollected: 0,
//             classTotalDue: 0
//         }));

//         const enrollmentMap = new Map();
//         enrollments.forEach(e => enrollmentMap.set(e._id.toString(), {
//             studentId: e.student._id,
//             studentName: e.student.name,
//             classId: e.class.toString()
//         }));

//         let totalCollected = 0;
//         let totalDue = 0;

//         fees.forEach(fee => {
//             totalCollected += fee.amountPaid;
//             totalDue += fee.amount;

//             const enrollmentInfo = enrollmentMap.get(fee.enrollment.toString());
//             if (!enrollmentInfo) return;

//             const classData = classMap.get(enrollmentInfo.classId);
//             if (!classData) return;

//             classData.classTotalCollected += fee.amountPaid;
//             classData.classTotalDue += fee.amount;

//             let studentSummary = classData.studentSummaries.get(enrollmentInfo.studentId.toString());
//             if (!studentSummary) {
//                 studentSummary = {
//                     studentName: enrollmentInfo.studentName,
//                     studentTotalPaid: 0,
//                     studentTotalDue: 0,
//                     fees: []
//                 };
//                 classData.studentSummaries.set(enrollmentInfo.studentId.toString(), studentSummary);
//             }

//             studentSummary.studentTotalPaid += fee.amountPaid;
//             studentSummary.studentTotalDue += fee.amount;
//             studentSummary.fees.push({
//                 period: `${fee.period.month}/${fee.period.year}`,
//                 status: fee.status,
//                 amount: fee.amount,
//                 amountPaid: fee.amountPaid,
//                 dueDate: fee.dueDate
//             });
//         });

//         const summaryByClass = Array.from(classMap.values()).map(classData => ({
//             ...classData,
//             studentSummaries: Array.from(classData.studentSummaries.values())
//         }));

//         const reportPayload = {
//             title: req.body.title || `Monthly Fee Summary - ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
//             reportType: 'fee_collection',
//             generatedBy: userId,
//             data: {
//                 totalCollected,
//                 totalDue,
//                 outstanding: totalDue - totalCollected,
//                 summaryByClass
//             },
//             createdAt: now // for tracking updates
//         };

//         // 3. Find and update existing report for the month, or create a new one
//         const existingReport = await Report.findOneAndUpdate(
//             {
//                 generatedBy: userId,
//                 reportType: 'fee_collection',
//                 createdAt: { $gte: startOfMonth, $lte: endOfMonth }
//             },
//             reportPayload,
//             { new: true, upsert: true } // upsert:true creates the doc if it doesn't exist
//         );

//         res.status(200).json({ success: true, data: existingReport });

//     } catch (error) {
//         console.error('Create report error:', error);
//         res.status(500).json({ success: false, message: 'Failed to create report' });
//     }
//   };
// exports.createReport = async (req, res) => {
//     try {
//         // 1. Find all classes taught by the current user
//         const userClasses = await Class.find({ teacher: req.user.id });
//         if (userClasses.length === 0) {
//             return res.status(400).json({ success: false, message: 'You have no classes to generate a report for.' });
//         }
//         const classIds = userClasses.map(c => c._id);

//         // 2. Find all enrollments associated with those classes
//         const enrollments = await Enrollment.find({ class: { $in: classIds } });
//         if (enrollments.length === 0) {
//             return res.status(400).json({ success: false, message: 'No students are enrolled in your classes.' });
//         }
//         const enrollmentIds = enrollments.map(e => e._id);

//         // 3. Find all fees that belong to those enrollments
//         const fees = await Fee.find({ enrollment: { $in: enrollmentIds } })
//             .populate({
//                 path: 'enrollment',
//                 populate: {
//                     path: 'student',
//                     select: 'name'
//                 }
//             });

//         // 4. Perform calculations
//         const totalCollected = fees.reduce((acc, fee) => acc + fee.amountPaid, 0);
//         const totalDue = fees.reduce((acc, fee) => acc + fee.amount, 0);
//         const outstanding = totalDue - totalCollected;

//         // 5. Structure the report data
//         const reportData = {
//             title: req.body.title || `Fee Collection Summary - ${new Date().toLocaleDateString()}`,
//             reportType: 'fee_collection',
//             data: {
//                 totalCollected,
//                 totalDue,
//                 outstanding,
//                 numberOfFees: fees.length,
//                 feeDetails: fees.map(f => ({
//                     studentName: f.enrollment?.student?.name || 'N/A',
//                     status: f.status,
//                     amountPaid: f.amountPaid,
//                     amountDue: f.amount,
//                     dueDate: f.dueDate,
//                 })),
//             },
//             generatedBy: req.user.id,
//         };

//         const report = await Report.create(reportData);
//         res.status(201).json({ success: true, data: report });

//     } catch (error) {
//         console.error('Create report error:', error);
//         res.status(500).json({ success: false, message: 'Failed to create report' });
//     }
//   };
/**
 * @desc    Get a single report
 * @route   GET /api/reports/:id
 * @access  Private
 */
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            generatedBy: req.user.id,
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch report' });
    }
  };



/**
 * @desc    Delete a report
 * @route   DELETE /api/reports/:id
 * @access  Private
 */
exports.deleteReport = async (req, res) => {
    try {
      const report = await Report.findOne({
        _id: req.params.id,
        generatedBy: req.user.id,
      });
  
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
  
      await report.deleteOne();
  
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete report' });
    }
  };