const express = require('express');
const Groq = require('groq-sdk');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Generate roadmap
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { currentSkills, targetRole, timeframe, experience } = req.body;

    if (!currentSkills || !targetRole) {
      return res.status(400).json({ message: 'Current skills and target role are required' });
    }

    console.log('Generating career roadmap with Groq...');

    const prompt = `You are an expert career coach. Create a detailed, actionable career roadmap.

Current Skills: ${currentSkills}
Target Role: ${targetRole}
Years of Experience: ${experience || 'Not specified'}
Timeframe: ${timeframe || '6-12 months'}

Generate a structured roadmap in markdown format with:
1. Executive Summary (2-3 sentences)
2. Gap Analysis (what skills/experience are missing)
3. Learning Path (month-by-month breakdown)
4. Recommended Resources (courses, books, projects)
5. Milestones & Checkpoints (what to achieve each month)
6. Interview Prep Tips (for the target role)
7. Project Ideas (to build portfolio)

Make it specific, actionable, and motivating. Use markdown formatting with headers, lists, and emphasis.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const roadmap = completion.choices[0].message.content;

    res.json({
      success: true,
      roadmap: roadmap,
    });
  } catch (error) {
    console.error('Roadmap generation error:', error.message);
    res.status(500).json({ message: error.message || 'Error generating roadmap' });
  }
});

module.exports = router;