const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: ['inappropriate', 'incorrect', 'spam', 'offensive', 'copyright', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['content', 'technical', 'user_behavior', 'copyright', 'other'],
    default: 'content'
  }
}, { timestamps: true });

// Index for better query performance
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reportedBy: 1 });
ReportSchema.index({ quiz: 1 });

module.exports = mongoose.model('Report', ReportSchema);