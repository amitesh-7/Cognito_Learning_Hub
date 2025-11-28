/**
 * Notification Routes
 * Redis-cached notification retrieval
 */

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const notificationManager = require('../services/notificationManager');
const createLogger = require('../../shared/utils/logger');

const logger = createLogger('notification-routes');

// ============================================
// GET USER NOTIFICATIONS
// ============================================

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

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

    res.json({
      success: true,
      notifications,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications',
    });
  }
});

// ============================================
// GET UNREAD COUNT
// ============================================

router.get('/:userId/unread/count', async (req, res) => {
  try {
    const { userId } = req.params;

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

router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

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

router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

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

router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

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
