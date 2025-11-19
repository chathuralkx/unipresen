const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Configure multer for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Inline middleware function
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await db.execute('SELECT id, email, password, role, name FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'student', name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Email, password and name required' });

    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(409).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)', [email, hashed, role, name]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      'SELECT id, email, role, name, registration_number, nic, academic_year, photo_url, address, contact_number, birthday, religion, district FROM users WHERE id = ?',
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get current user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/me
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, registration_number, nic, academic_year, address, contact_number, birthday, religion, district } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (registration_number !== undefined) { fields.push('registration_number = ?'); values.push(registration_number); }
    if (nic !== undefined) { fields.push('nic = ?'); values.push(nic); }
    if (academic_year !== undefined) { fields.push('academic_year = ?'); values.push(academic_year); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }
    if (contact_number !== undefined) { fields.push('contact_number = ?'); values.push(contact_number); }
    if (birthday !== undefined) { fields.push('birthday = ?'); values.push(birthday); }
    if (religion !== undefined) { fields.push('religion = ?'); values.push(religion); }
    if (district !== undefined) { fields.push('district = ?'); values.push(district); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (!fields.length) {
      const [rows] = await db.execute(
        'SELECT id, email, role, name, registration_number, nic, academic_year, photo_url, address, contact_number, birthday, religion, district FROM users WHERE id = ?',
        [userId]
      );
      return res.json({ user: rows[0] });
    }

    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);

    const [rows] = await db.execute(
      'SELECT id, email, role, name, registration_number, nic, academic_year, photo_url, address, contact_number, birthday, religion, district FROM users WHERE id = ?',
      [userId]
    );
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email or Registration Number already in use' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/me/upload-photo
router.post('/me/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userId = req.user.id;
    const photoUrl = `/uploads/${req.file.filename}`;

    await db.execute('UPDATE users SET photo_url = ? WHERE id = ?', [photoUrl, userId]);

    const [rows] = await db.execute(
      'SELECT id, email, role, name, registration_number, nic, academic_year, photo_url, address, contact_number, birthday, religion, district FROM users WHERE id = ?',
      [userId]
    );

    return res.json({ user: rows[0], message: 'Photo uploaded successfully' });
  } catch (err) {
    console.error('Photo upload error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
