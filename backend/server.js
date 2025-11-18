const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRouter = require('./routes/auth'); // ensure path correct
app.use('/api/auth', authRouter);

// simple 404 for API
app.use('/api/*', (req, res) => res.status(404).json({ message: 'API route not found' }));

// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
module.exports = app;