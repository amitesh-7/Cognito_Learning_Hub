/**
 * Friends Routes (Wrapper around Follows)
 */

const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const Friendship = require('../models/Friendship');
const Notification = require('../models/Notification');
const notificationManager = require('../services/notificationManager');
const createLogger = require('../../shared/utils/logger');
const { authenticateToken } = require('../../shared/middleware/auth');
const axios = require('axios');

const logger = createLogger('friends-routes');
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Get user's friends list (accepted friendships only)
 * Supports both Friendship (monolith) and Follow (microservices) models
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendsList = [];

    logger.info(`Fetching friends for user ${userId}`);

    // 1. Get friends from Friendship model (monolith compatibility)
    const monolithFriendships = await Friendship.find({
      $or: [
        { requester: userId },
        { recipient: userId },
      ],
      status: 'accepted',
    })
      .populate('requester', 'name email picture')
      .populate('recipient', 'name email picture')
      .lean();

    logger.info(`Found ${monolithFriendships.length} monolith friendships`);

    // Process monolith friendships
    monolithFriendships.forEach(friendship => {
      const friendRequester = friendship.requester._id.toString();
      const friendRecipient = friendship.recipient._id.toString();
      const friend = friendRequester === userId.toString() 
        ? friendship.recipient 
        : friendship.requester;
      
      friendsList.push({
        friendshipId: friendship._id,
        friend: {
          _id: friend._id,
          name: friend.name,
          email: friend.email,
          picture: friend.picture,
        },
        since: friendship.createdAt,
      });
    });

    // 2. Get friends from Follow model (microservices)
    const follows = await Follow.find({
      $or: [
        { followerId: userId },
        { followingId: userId },
      ],
    })
      .lean();

    logger.info(`Found ${follows.length} follow records`);

    // Extract unique friend IDs and check mutual follows
    const followingIds = new Set();
    const followerIds = new Set();

    follows.forEach(f => {
      const followerId = f.followerId.toString();
      const followingId = f.followingId.toString();
      const userIdStr = userId.toString();

      if (followerId === userIdStr) {
        followingIds.add(followingId);
      }
      if (followingId === userIdStr) {
        followerIds.add(followerId);
      }
    });

    // Find mutual friends (bidirectional follows) from microservices
    const mutualFriendIds = [...followingIds].filter(id => followerIds.has(id));

    logger.info(`Found ${mutualFriendIds.length} mutual friends from Follow model`);

    // Build friends list from Follow model
    follows
      .filter(f => {
        const followerId = f.followerId.toString();
        const followingId = f.followingId.toString();
        const userIdStr = userId.toString();
        const friendId = followerId === userIdStr ? followingId : followerId;
        return mutualFriendIds.includes(friendId);
      })
      .forEach(f => {
        const followerId = f.followerId.toString();
        const followingId = f.followingId.toString();
        const userIdStr = userId.toString();
        const friendId = followerId === userIdStr ? followingId : followerId;
        const friendName = followerId === userIdStr ? f.followingName : f.followerName;
        
        // Avoid duplicates
        if (!friendsList.find(friend => friend.friend._id.toString() === friendId)) {
          friendsList.push({
            friendshipId: f._id,
            friend: {
              _id: friendId,
              name: friendName,
            },
            since: f.createdAt,
          });
        }
      });

    // Sort by most recent
    friendsList.sort((a, b) => new Date(b.since) - new Date(a.since));

    logger.info(`Total friends found: ${friendsList.length}`);
    
    // Disable cache for friends list
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({ friends: friendsList });
  } catch (error) {
    logger.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Failed to fetch friends' });
  }
});

/**
 * Get suggested friends
 */
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get users that this user is following
    const following = await Follow.find({ followerId: userId })
      .select('followingId')
      .lean();

    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Exclude self

    // Find users followed by people you follow (friends of friends)
    const suggestions = await Follow.find({
      followerId: { $in: followingIds },
      followingId: { $nin: followingIds },
    })
      .select('followingId followingName')
      .limit(10)
      .lean();

    // Count mutual connections
    const suggestionMap = new Map();
    suggestions.forEach(s => {
      const key = s.followingId;
      if (suggestionMap.has(key)) {
        suggestionMap.get(key).mutualConnections++;
      } else {
        suggestionMap.set(key, {
          userId: s.followingId,
          name: s.followingName,
          mutualConnections: 1,
        });
      }
    });

    const suggestedUsers = Array.from(suggestionMap.values())
      .sort((a, b) => b.mutualConnections - a.mutualConnections)
      .slice(0, 5);

    res.json({
      success: true,
      data: suggestedUsers,
    });
  } catch (error) {
    logger.error('Error fetching friend suggestions:', error);
    res.status(500).json({
      success: true,
      data: [],
    });
  }
});

/**
 * Send friend request (create follow)
 */
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.userId;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (userId === recipientId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: userId,
      followingId: recipientId,
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already sent friend request' });
    }

    // Get user names (assuming we have them from JWT or need to fetch)
    const followerName = req.user.name || 'Unknown';
    
    // Create follow record
    const follow = new Follow({
      followerId: userId,
      followingId: recipientId,
      followerName,
      followingName: 'Unknown', // Will be updated when recipient accepts
    });

    await follow.save();

    // Create notification for recipient
    const notification = new Notification({
      notificationId: `friend-req-${userId}-${recipientId}-${Date.now()}`,
      userId: recipientId,
      actorId: userId,
      actorName: followerName,
      type: 'friend-request',
      title: 'New Friend Request',
      message: `${followerName} sent you a friend request`,
      metadata: { 
        followId: follow._id,
        friendshipId: userId // Use sender's ID for responding
      },
    });

    await notification.save();

    // Add to Redis cache
    await notificationManager.addNotification(recipientId, notification);

    logger.info(`Friend request sent from ${userId} to ${recipientId}`);

    res.json({ 
      message: 'Friend request sent successfully',
      followId: follow._id 
    });
  } catch (error) {
    logger.error('Error sending friend request:', error.message);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
});

/**
 * Accept friend request (follow back)
 */
router.post('/respond', authenticateToken, async (req, res) => {
  try {
    const { requesterId, action } = req.body;
    const userId = req.user.userId;

    if (!requesterId || !action) {
      return res.status(400).json({ message: 'Requester ID and action are required' });
    }

    if (action === 'accept') {
      // Check if requester is following me
      const theirFollow = await Follow.findOne({
        followerId: requesterId,
        followingId: userId,
      });

      if (!theirFollow) {
        return res.status(404).json({ message: 'Friend request not found' });
      }

      // Check if I'm already following them
      const myFollow = await Follow.findOne({
        followerId: userId,
        followingId: requesterId,
      });

      if (!myFollow) {
        // Create follow back to complete friendship
        const followBack = new Follow({
          followerId: userId,
          followingId: requesterId,
          followerName: req.user.name || 'Unknown',
          followingName: theirFollow.followerName,
        });
        await followBack.save();
      }

      res.json({ message: 'Friend request accepted' });
    } else if (action === 'decline') {
      // Remove their follow request
      await Follow.deleteOne({
        followerId: requesterId,
        followingId: userId,
      });

      res.json({ message: 'Friend request declined' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    logger.error('Error responding to friend request:', error.message);
    res.status(500).json({ message: 'Failed to respond to friend request' });
  }
});

/**
 * Respond to friend request (PUT endpoint for frontend compatibility)
 */
router.put('/respond/:requesterId', authenticateToken, async (req, res) => {
  try {
    const { requesterId } = req.params;
    const { action } = req.body;
    const userId = req.user.userId;

    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    if (action === 'accept') {
      // Check if requester is following me
      const theirFollow = await Follow.findOne({
        followerId: requesterId,
        followingId: userId,
      });

      if (!theirFollow) {
        return res.status(404).json({ message: 'Friend request not found' });
      }

      // Check if I'm already following them
      const myFollow = await Follow.findOne({
        followerId: userId,
        followingId: requesterId,
      });

      if (!myFollow) {
        // Create follow back to complete friendship
        const followBack = new Follow({
          followerId: userId,
          followingId: requesterId,
          followerName: req.user.name || 'Unknown',
          followingName: theirFollow.followerName,
        });
        await followBack.save();
      }

      // Mark notification as read
      await Notification.updateMany(
        {
          recipient: userId,
          sender: requesterId,
          type: 'friend-request',
        },
        { isRead: true }
      );

      res.json({ message: 'Friend request accepted' });
    } else if (action === 'decline') {
      // Remove their follow request
      await Follow.deleteOne({
        followerId: requesterId,
        followingId: userId,
      });

      // Mark notification as read
      await Notification.updateMany(
        {
          userId: userId,
          actorId: requesterId,
          type: 'friend-request',
        },
        { isRead: true }
      );

      res.json({ message: 'Friend request declined' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    logger.error('Error responding to friend request:', error.message);
    res.status(500).json({ message: 'Failed to respond to friend request' });
  }
});

/**
 * Remove friend (delete both follows)
 */
router.delete('/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Delete both follow records
    await Follow.deleteMany({
      $or: [
        { followerId: userId, followingId: friendId },
        { followerId: friendId, followingId: userId },
      ],
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    logger.error('Error removing friend:', error.message);
    res.status(500).json({ message: 'Failed to remove friend' });
  }
});

module.exports = router;
