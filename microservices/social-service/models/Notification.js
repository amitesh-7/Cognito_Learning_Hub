/**
 * Notification Model
 * Optimized for user notification queries
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'like',
      'comment',
      'follow',
      'mention',
      'share',
      'achievement',
      'quiz-invite',
      'challenge',
      'system',
    ],
    required: true,
    index: true,
  },
  
  // Actor (who triggered the notification)
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actorName: String,
  actorPicture: String,
  
  // Content
  title: String,
  message: {
    type: String,
    required: true,
  },
  
  // Related entities
  relatedPostId: String,
  relatedCommentId: String,
  relatedQuizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
  },
  
  // Link/action
  actionUrl: String,
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal',
  },
  
}, {
  timestamps: true,
});

// ============================================
// INDEXES
// ============================================

// Get user notifications (most common query)
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Count unread
notificationSchema.index({ userId: 1, isRead: 1 });

// TTL for old notifications (auto-cleanup after 90 days)
notificationSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 7776000, // 90 days
});

// ============================================
// STATICS
// ============================================

/**
 * Get user notifications (paginated)
 */
notificationSchema.statics.getUserNotifications = async function(userId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    userId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v')
    .lean();
};

/**
 * Get unread count
 */
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    userId,
    isRead: false,
    isDeleted: false,
  });
};

/**
 * Mark as read
 */
notificationSchema.statics.markAsRead = async function(notificationIds) {
  return this.updateMany(
    { notificationId: { $in: notificationIds } },
    { isRead: true }
  );
};

/**
 * Mark all as read
 */
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
