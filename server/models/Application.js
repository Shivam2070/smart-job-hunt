const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: String,
    company: String,
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewing', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    interviewDate: Date,
    notes: String,
    jobUrl: String,
    salary: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);