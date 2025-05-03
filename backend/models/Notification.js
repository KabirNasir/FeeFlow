const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fee_reminder', 'payment_confirmation', 'class_update', 'general'],
    required: [true, 'Please specify notification type']
  },
  recipient: {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    email: {
      type: String,
      required: [true, 'Please provide recipient email']
    },
    name: {
      type: String
    }
  },
  relatedTo: {
    feeRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeRecord'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }
  },
  content: {
    subject: {
      type: String,
      required: [true, 'Please provide email subject']
    },
    message: {
      type: String,
      required: [true, 'Please provide email message']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['email', 'sms'],
    default: 'email'
  },
  sentAt: {
    type: Date
  },
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  scheduledFor: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
NotificationSchema.index({ status: 1, scheduledFor: 1 });
NotificationSchema.index({ 'recipient.student': 1 });
NotificationSchema.index({ 'relatedTo.feeRecord': 1 });

module.exports = mongoose.model('Notification', NotificationSchema);