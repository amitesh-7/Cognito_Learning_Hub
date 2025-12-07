const jwt = require("jsonwebtoken");

/**
 * Verify JWT token middleware
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No authorization header provided",
      });
    }
    
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    
    req.user = decoded.user || decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
    
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      req.user = decoded.user || decoded;
    }
    
    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

module.exports = { verifyToken, optionalAuth };
