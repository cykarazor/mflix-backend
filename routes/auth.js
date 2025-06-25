const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const jwt      = require('jsonwebtoken');
const JWT_SEC  = process.env.JWT_SECRET;

// REGISTER: name, email, password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN: by email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SEC,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
