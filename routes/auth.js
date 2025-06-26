const express  = require('express');
const router   = express.Router();
const bcrypt = require('bcrypt');
const SampleUser = require('../models/User');
const jwt      = require('jsonwebtoken');
const JWT_SECRET  = process.env.JWT_SECRET;

// REGISTER: name, email, password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await SampleUser.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new SampleUser({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN: by email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await SampleUser.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
