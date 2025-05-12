const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: [true, 'Please specify the teacher who created this student']
  },
  phone: {
    type: String
  },
  parentInfo: {
    name: {
      type: String,
      required: [true, 'Please add parent name']
    },
    email: {
      type: String,
      required: [true, 'Please add parent email for notifications'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please add parent phone number']
    },
    preferredContact: {
      type: String,
      enum: ['email', 'phone'],
      default: 'email'
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

// Virtual for classes enrolled in
StudentSchema.virtual('classes', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student',
  justOne: false
});

module.exports = mongoose.model('Student', StudentSchema);