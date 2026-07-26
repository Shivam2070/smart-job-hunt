const express = require('express');
const Groq = require('groq-sdk');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

console.log('✅ Groq initialized');

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

// Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log('Processing chat message...');

    // Build messages array with conversation history
    const messages = [
      {
        role: "user",
        content: `You are an expert career coach and job search mentor. Help with job search, interviews, resumes, salary negotiation, LinkedIn, and career growth. Be friendly, helpful, and specific. Provide actionable advice.`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = completion.choices[0].message.content;

    res.json({
      success: true,
      message: assistantMessage,
      role: 'assistant',
    });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ message: error.message || 'Error processing message' });
  }
});

module.exports = router;