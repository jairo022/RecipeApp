const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup route - NO middleware, NO next
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Create user
    const user = new User({ username, email, password });
    await user.save();
    
    // Create token
    const token = jwt.sign({ userId: user._id }, 'mysecretkey');
    
    // Send response
    return res.status(201).json({
      token,
      user: { _id: user._id, username, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Login route - NO middleware, NO next
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password (using bcrypt.compare directly)
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ userId: user._id }, 'mysecretkey');
    
    // Send response
    return res.json({
      token,
      user: { _id: user._id, username: user.username, email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;