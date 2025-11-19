const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

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
    
    // Add user info to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role
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

// Sample route
router.get('/me', auth, async (req, res) => {
  try {
    // Respond with user info
    res.json({ 
      id: req.user.id, 
      role: req.user.role,
      message: 'User information retrieved successfully.' 
    });
  } catch (error) {
    console.error('Error retrieving user info:', error.message);
    res.status(500).json({ message: 'Server error while retrieving user info.' });
  }
});

module.exports = { auth, authorize, router };