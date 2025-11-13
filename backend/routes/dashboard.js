const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// Protected routes - require authentication
router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/recent-bookings', auth, dashboardController.getRecentBookings);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Dashboard routes are working!',
    available_routes: {
      stats: 'GET /api/dashboard/stats (requires auth)',
      recentBookings: 'GET /api/dashboard/recent-bookings (requires auth)'
    }
  });
});

module.exports = router;