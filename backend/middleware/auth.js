const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        requiresLogin: true 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const [users] = await db.query(
      'SELECT user_id, name, email, role, department_id FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        message: 'Token is not valid. User not found.',
        requiresLogin: true 
      });
    }

    // Add user info to request object
    req.user = {
      userId: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      role: users[0].role,
      departmentId: users[0].department_id
    };

    console.log(`🔐 User authenticated: ${req.user.name} (${req.user.role})`);
    next();
    
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please login again.',
        requiresLogin: true 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.',
        requiresLogin: true 
      });
    } else {
      return res.status(500).json({ 
        message: 'Authentication server error.' 
      });
    }
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Please login first.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

module.exports = { auth, authorize };