const logger = require('../utils/logger');

const moderatorMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      logger.warn(`Unauthorized moderator access attempt by user ${req.user.userId}`);
      return res.status(403).json({ error: 'Moderator or Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Moderator middleware error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = moderatorMiddleware;
