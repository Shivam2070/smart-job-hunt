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

// Generate cover letter
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { jobTitle, company, yourName, yourExperience, keySkills } = req.body;

    if (!jobTitle || !company || !yourName) {
      return res.status(400).json({ message: 'Job title, company, and name are required' });
    }

    console.log('Generating cover letter with Groq...');

    const prompt = `Write a professional, compelling cover letter for a job application.

Job Title: ${jobTitle}
Company: ${company}
Applicant Name: ${yourName}
Years of Experience: ${yourExperience || 'Not specified'}
Key Skills: ${keySkills || 'Not specified'}

Requirements:
- Professional and formal tone
- 3-4 paragraphs
- Show enthusiasm for the role and company
- Highlight relevant skills and experience
- Strong opening and closing
- Ready to send email format (with placeholders for date and address if needed)

Generate ONLY the cover letter text, no additional commentary.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const coverLetter = completion.choices[0].message.content;

    res.json({
      success: true,
      coverLetter: coverLetter,
      job: {
        title: jobTitle,
        company: company,
      },
    });
  } catch (error) {
    console.error('Cover letter generation error:', error.message);
    res.status(500).json({ message: error.message || 'Error generating cover letter' });
  }
});

module.exports = router;