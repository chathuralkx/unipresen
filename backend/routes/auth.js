const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working!',
    available_routes: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me (requires authentication)'
    }
  });
});

module.exports = router;