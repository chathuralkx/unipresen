const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  console.log('Attempting to connect to database:', { 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    database: process.env.DB_NAME 
  });
});

module.exports = app;