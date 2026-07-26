const express = require('express');
const Application = require('../models/Application');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get all applications for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id }).sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { jobTitle, company, status, interviewDate, notes, jobUrl, salary } = req.body;

    const application = new Application({
      userId: req.user.id,
      jobTitle,
      company,
      status: status || 'Applied',
      interviewDate,
      notes,
      jobUrl,
      salary,
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, interviewDate, notes } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, interviewDate, notes },
      { new: true }
    );

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;