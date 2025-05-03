const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  feeRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeRecord',
    required: [true, 'Please provide fee record ID']
  },
  amount: {
    type: Number,
    required: [true, 'Please specify payment amount']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'online', 'other'],
    default: 'cash'
  },
  transactionReference: {
    type: String
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify who received the payment']
  },
  notes: {
    type: String
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptDetails: {
    sentOn: Date,
    method: {
      type: String,
      enum: ['email', 'printed'],
      default: 'email'
    },
    recipientEmail: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);