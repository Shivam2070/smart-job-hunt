const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');
const resumeRoutes = require('./routes/resume');
const applicationRoutes = require('./routes/applications');
const roadmapRoutes = require('./routes/roadmap');
const jobRoutes = require('./routes/jobs');
const coverLetterRoutes = require('./routes/coverLetter');
const jobMatchRoutes = require('./routes/jobMatch');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/job-match', jobMatchRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Job Hunt Companion API' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});