const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bug', 'content', 'user', 'quiz', 'abuse', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  relatedEntityType: {
    type: String,
    enum: ['user', 'quiz', 'question', 'comment', 'post', 'other'],
    required: false
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  resolution: {
    type: String,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  attachments: [{
    url: String,
    filename: String,
    mimeType: String
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    screenResolution: String,
    browser: String,
    platform: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
reportSchema.index({ userId: 1, status: 1, createdAt: -1 });
reportSchema.index({ type: 1, priority: 1 });

module.exports = mongoose.model('Report', reportSchema);
