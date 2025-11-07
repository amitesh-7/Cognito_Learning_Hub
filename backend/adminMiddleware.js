const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET;

  module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Check if the user has the 'Admin' role
      if (decoded.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Access denied. Admin role required.' });
      }
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };