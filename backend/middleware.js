const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET; // Use the same secret as in index.js

  module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded.user; // Add user from payload to the request object
      next(); // Move to the next middleware or route handler
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };