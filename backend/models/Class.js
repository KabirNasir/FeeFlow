const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  grade: {
    type: String,
    required: [true, 'Please add a grade level']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the teacher']
  },
  description: {
    type: String
  },
  schedule: {
    days: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Please specify class days']
    },
    startTime: {
      type: String,
      required: [true, 'Please specify start time']
    },
    endTime: {
      type: String,
      required: [true, 'Please specify end time']
    }
  },
  fees: {
    amount: {
      type: Number,
      required: [true, 'Please specify fee amount']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    dueDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1 // Day of month when payment is due
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for students enrolled in this class
ClassSchema.virtual('students', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'class',
  justOne: false
});

module.exports = mongoose.model('Class', ClassSchema);