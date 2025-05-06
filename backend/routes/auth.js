const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, location } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO User (Name, Email, Password, Location) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, location || null]
    );
    return res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user.UserID, name: user.Name, email: user.Email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, user: { userId: user.UserID, name: user.Name, email: user.Email, location: user.Location } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 