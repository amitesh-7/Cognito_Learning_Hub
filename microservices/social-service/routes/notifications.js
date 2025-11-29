/**
 * Notification Routes
 * Redis-cached notification retrieval
 */

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const notificationManager = require('../services/notificationManager');
const createLogger = require('../../shared/utils/logger');
const { authenticateToken } = require('../../shared/middleware/auth');

const logger = createLogger('notification-routes');

// ============================================
// GET USER NOTIFICATIONS
// ============================================

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get from JWT token
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Try Redis first (fast)
    let notifications = await notificationManager.getNotifications(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // Fallback to database if Redis empty
    if (notifications.length === 0 && parseInt(page) === 1) {
      notifications = await Notification.getUserNotifications(
        userId,
        parseInt(page),
        parseInt(limit)
      );
    }

    // Get unread count
    const unreadCount = await notificationManager.getUnreadCount(userId);

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
});

// ============================================
// GET UNREAD COUNT
// ============================================

router.get('/:userId/unread/count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Authorization: Users can only access their own unread count
    if (userId !== req.user.userId && !['Admin', 'Moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot access other users\' unread count',
      });
    }

    // Get from Redis (fast O(1))
    const count = await notificationManager.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
});

// ============================================
// MARK AS READ
// ============================================

router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Get notification to verify ownership
    const notification = await Notification.findOne({ notificationId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Authorization: Users can only mark their own notifications as read
    if (notification.userId.toString() !== req.user.userId && !['Admin', 'Moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot mark other users\' notifications as read',
      });
    }

    // Update Redis
    await notificationManager.markAsRead(notificationId);

    // Update database
    await Notification.findOneAndUpdate(
      { notificationId },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark as read',
    });
  }
});

// ============================================
// MARK ALL AS READ
// ============================================

router.put('/:userId/read-all', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Authorization: Users can only mark their own notifications as read
    if (userId !== req.user.userId && !['Admin', 'Moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot mark other users\' notifications as read',
      });
    }

    // Update Redis
    await notificationManager.markAllAsRead(userId);

    // Update database
    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all as read',
    });
  }
});

// ============================================
// DELETE NOTIFICATION
// ============================================

router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Get notification to verify ownership
    const notification = await Notification.findOne({ notificationId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Authorization: Users can only delete their own notifications
    if (notification.userId.toString() !== req.user.userId && !['Admin', 'Moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete other users\' notifications',
      });
    }

    // Delete from Redis
    await notificationManager.deleteNotification(notificationId);

    // Soft delete in database
    await Notification.findOneAndUpdate(
      { notificationId },
      { isDeleted: true }
    );

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

module.exports = router;
