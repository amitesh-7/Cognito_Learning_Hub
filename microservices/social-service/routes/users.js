/**
 * Users Routes (Search users, get user info)
 */

const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const createLogger = require('../../shared/utils/logger');
const { authenticateToken } = require('../../shared/middleware/auth');
const axios = require('axios');

const logger = createLogger('users-routes');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Search users for adding friends
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters' 
      });
    }

    // Fetch users from auth service
    const response = await axios.get(`${AUTH_SERVICE}/api/users/search`, {
      params: { query },
      headers: {
        'x-auth-token': req.headers['x-auth-token'],
      },
    });

    // Handle ApiResponse wrapper
    const users = response.data?.data?.users || response.data?.users || [];

    // Check friendship/follow status for each user
    const usersWithStatus = await Promise.all(
      users
        .filter(user => user._id !== userId) // Exclude current user
        .map(async (user) => {
          // Check if mutual follows exist (friendship)
          const userFollowsMe = await Follow.findOne({
            followerId: user._id,
            followingId: userId,
          });

          const iFollowUser = await Follow.findOne({
            followerId: userId,
            followingId: user._id,
          });

          let friendshipStatus = 'none';
          let friendshipId = null;

          if (userFollowsMe && iFollowUser) {
            friendshipStatus = 'accepted'; // Mutual follows = friends
            friendshipId = iFollowUser._id;
          } else if (iFollowUser) {
            friendshipStatus = 'pending'; // I follow them, waiting for follow back
            friendshipId = iFollowUser._id;
          } else if (userFollowsMe) {
            friendshipStatus = 'requested'; // They follow me, I can follow back
            friendshipId = userFollowsMe._id;
          }

          return {
            ...user,
            friendshipStatus,
            friendshipId,
          };
        })
    );

    res.json({ users: usersWithStatus });
  } catch (error) {
    logger.error('Error searching users:', error.message || 'Unknown error');
    res.status(500).json({ message: 'Failed to search users' });
  }
});

module.exports = router;
