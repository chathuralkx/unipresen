const express = require('express');
const router = express.Router();

// Test route for bookings
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Booking routes are working!',
    available_routes: [
      'GET /',
      'GET /:id',
      'POST /',
      'PUT /:id',
      'DELETE /:id'
    ]
  });
});

module.exports = router;