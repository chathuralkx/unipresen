const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/* -------------------------------------------
   LOGIN (POST /api/auth/login)
--------------------------------------------*/
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const [rows] = await db.execute('SELECT id, email, password, role, name FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      message: 'Login successful',
      token,
      role: user.role,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


/* -------------------------------------------
   REGISTER  (POST /api/auth/register)
--------------------------------------------*/
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'student', name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)', [email, hashed, role, name]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
