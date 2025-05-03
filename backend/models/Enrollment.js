const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide student ID']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide class ID']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  joinedOn: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index to ensure a student can only be enrolled once in a class
EnrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

// Virtual to get fee records related to this enrollment
EnrollmentSchema.virtual('feeRecords', {
  ref: 'FeeRecord',
  localField: '_id',
  foreignField: 'enrollment',
  justOne: false
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);