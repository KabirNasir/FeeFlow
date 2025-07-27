const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    reportType: {
        type: String,
        required: true,
        enum: [
            'fee_collection',
            'student_enrollment',
            'class_attendance', // Example for future use
        ],
    },
    // Data will store the main content of the report
    data: {
        type: Object,
        required: true,
    },
    generatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Report', ReportSchema);