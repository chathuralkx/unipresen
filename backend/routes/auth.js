const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');  // MySQL connection
const jwt = require('jsonwebtoken');

/* -------------------------------------------
   REGISTER  (POST /api/auth/register)
--------------------------------------------*/
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;

    // Basic validation
    if (!name || !email || !password || !department_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.execute(
      "INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, department_id]
    );

    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


/* -------------------------------------------
   LOGIN (POST /api/auth/login)
--------------------------------------------*/
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await db.execute('SELECT id, email, password, role FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      message: 'Login successful',
      token,
      role: user.role,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
