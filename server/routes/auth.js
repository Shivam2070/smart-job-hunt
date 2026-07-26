const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    console.log('=== SIGNUP START ===');
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // HASH PASSWORD BEFORE SAVING
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    // Create user with hashed password
    console.log('Creating user...');
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    await user.save();
    console.log('User saved:', user._id);

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
    console.log('=== SIGNUP SUCCESS ===');
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
// LOGIN
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN START ===');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    console.log('Finding user by email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    console.log('Comparing passwords...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create token
    console.log('Creating token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
    console.log('=== LOGIN SUCCESS ===');
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// GET USER PROFILE (Protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { contactNumber, highestQualification, employmentStatus, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        contactNumber,
        highestQualification,
        employmentStatus,
        skills: skills ? (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills) : [],
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;