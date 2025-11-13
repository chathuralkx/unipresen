const express = require('express');
const router = express.Router();

// Test route for users
router.get('/test', (req, res) => {
  res.json({ 
    message: 'User routes are working!',
    available_routes: [
      'GET /',
      'GET /:id',
      'PUT /:id',
      'DELETE /:id'
    ]
  });
});

module.exports = router;