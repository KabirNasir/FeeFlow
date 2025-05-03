const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify token and attach user to request
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, invalid token' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token provided' 
    });
  }
};

/**
 * Role-based authorization
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`
      });
    }
    next();
  };
};