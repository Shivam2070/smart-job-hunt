const express = require('express');
const multer = require('multer');
const PDFParser = require('pdf2json');
const Groq = require('groq-sdk');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

// Extract text from PDF
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on('pdfParser_dataError', (errData) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.loadPDF(filePath);
  });
};

// Upload and analyze resume
router.post('/analyze', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Extracting text from PDF...');
    const pdfPath = req.file.path;

    // Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractTextFromPDF(pdfPath);
    } catch (error) {
      console.error('PDF extraction error:', error.message);
      fs.unlinkSync(pdfPath);
      return res.status(400).json({ message: 'Error reading PDF. Make sure it\'s a valid PDF file.' });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      fs.unlinkSync(pdfPath);
      return res.status(400).json({ message: 'Could not extract text from PDF' });
    }

    console.log('Text extracted, analyzing with Groq...');

    // Analyze with Groq
    const prompt = `
You are an ATS (Applicant Tracking System) expert.

Analyze the following resume and return ONLY valid JSON.

{
  "atsScore": 0,
  "keywords": [],
  "suggestions": [],
  "feedback": ""
}

Rules:
- ATS score must be between 0 and 100.
- Give exactly 10 keywords.
- Give exactly 5 suggestions.
- Do not return markdown.
- Do not return explanation.
- Return JSON only.

Resume:

${resumeText}
`;

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  temperature: 0.2,
  max_tokens: 1024,
});

const responseText = completion.choices[0].message.content;

    // Extract JSON from response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysis = JSON.parse(jsonMatch[0].trim());
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      fs.unlinkSync(pdfPath);
      return res.status(400).json({ 
        message: 'Error parsing analysis response. Please try again.',
      });
    }

    // Validate analysis
    if (analysis.atsScore === undefined || !analysis.keywords || !analysis.suggestions) {
      fs.unlinkSync(pdfPath);
      return res.status(400).json({ 
        message: 'Invalid analysis response.',
      });
    }

    // Ensure atsScore is a number between 0-100
    const atsScore = Math.min(100, Math.max(0, parseInt(analysis.atsScore) || 0));

    // Save resume to database
    const resume = new Resume({
      userId: req.user.id,
      fileName: req.file.originalname,
      textContent: resumeText,
      atsScore: atsScore,
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords.slice(0, 10) : [],
      suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions.slice(0, 5) : [],
    });

    await resume.save();

    // Clean up uploaded file
    fs.unlinkSync(pdfPath);

    console.log('Resume analysis complete!');

    res.json({
      success: true,
      resume: {
        id: resume._id,
        atsScore: atsScore,
        keywords: resume.keywords,
        suggestions: resume.suggestions,
        feedback: analysis.feedback || 'Resume analysis complete',
      },
    });
  } catch (error) {
    console.error('Resume analysis error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting temp file:', e);
      }
    }
    res.status(500).json({ message: error.message || 'Error analyzing resume' });
  }
});

// Get user's resumes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ analyzedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete resume
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;