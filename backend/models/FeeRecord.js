const mongoose = require('mongoose');

const FeeRecordSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Please provide enrollment ID']
  },
  amount: {
    type: Number,
    required: [true, 'Please specify fee amount']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please specify due date']
  },
  period: {
    month: {
      type: Number,
      required: [true, 'Please specify month'],
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: [true, 'Please specify year']
    }
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'partially_paid', 'overdue', 'waived'],
    default: 'unpaid'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  remindersSent: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      method: {
        type: String,
        enum: ['email', 'sms'],
        default: 'email'
      },
      status: {
        type: String,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending'
      },
      responseMessage: String
    }
  ],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
FeeRecordSchema.index({ enrollment: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });
FeeRecordSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('FeeRecord', FeeRecordSchema);