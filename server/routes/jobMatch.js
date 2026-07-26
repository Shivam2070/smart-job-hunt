const express = require('express');
const multer = require('multer');
const PDFParser = require('pdf2json');
const Groq = require('groq-sdk');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const router = express.Router();

// Setup file upload
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

// Extract job description from URL
const extractJobFromURL = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Try multiple common selectors
    let jobDescription = '';
    
    jobDescription = $('[class*="job-description"]').text() ||
                    $('[class*="description"]').text() ||
                    $('main').text() ||
                    $('article').text() ||
                    $('body').text();
    
    if (!jobDescription) {
      throw new Error('Could not extract job description from URL');
    }
    
    return jobDescription.substring(0, 3000); // Limit to 3000 chars
  } catch (error) {
    throw new Error('Error fetching job from URL: ' + error.message);
  }
};

// Extract PDF endpoint
router.post('/extract-pdf', authenticateToken, upload.single('file'), async (req, res) => {
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

    // Clean up uploaded file
    fs.unlinkSync(pdfPath);

    console.log('PDF text extracted successfully');

    res.json({
      success: true,
      text: resumeText,
    });
  } catch (error) {
    console.error('Resume extraction error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting temp file:', e);
      }
    }
    res.status(500).json({ message: error.message || 'Error extracting PDF' });
  }
});

// Analyze job match
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { resumeText, jobDescription, jobUrl } = req.body;

    if (!resumeText || (!jobDescription && !jobUrl)) {
      return res.status(400).json({ 
        message: 'Resume and job description (or URL) are required' 
      });
    }

    console.log('Analyzing job match...');

    let finalJobDescription = jobDescription;

    // If URL provided, extract job description
    if (jobUrl && !jobDescription) {
      console.log('Extracting job from URL...');
      finalJobDescription = await extractJobFromURL(jobUrl);
    }

    const prompt = `You are an expert career coach and recruiter. Analyze the match between a resume and a job description.

Return ONLY valid JSON in this exact format:
{
  "matchPercentage": 0,
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "hasSkills": [],
  "salaryEstimate": "",
  "learningPath": [],
  "recommendation": ""
}

Requirements:
- matchPercentage: 0-100 (integer)
- strengths: array of 5 key strengths (strings)
- weaknesses: array of 3 weaknesses (strings)
- missingSkills: array of 5 missing skills (strings)
- hasSkills: array of 5 matching skills (strings)
- salaryEstimate: estimated salary range based on skills and role (string)
- learningPath: array of 5 courses/skills to learn in priority order (strings)
- recommendation: brief recommendation (1-2 sentences, string)

Do not return markdown. Return JSON only.

Resume:
${resumeText}

Job Description:
${finalJobDescription}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content;
    console.log('Parsing analysis...');

    // Extract JSON from response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Response text:', responseText);
      return res.status(400).json({ 
        message: 'Error parsing analysis response. Please try again.',
      });
    }

    // Validate analysis
    if (analysis.matchPercentage === undefined || !analysis.strengths || !analysis.weaknesses || !analysis.missingSkills || !analysis.hasSkills) {
      return res.status(400).json({ 
        message: 'Invalid analysis response. Missing required fields.',
      });
    }

    res.json({
      success: true,
      analysis: analysis,
    });
  } catch (error) {
    console.error('Job match analysis error:', error.message);
    res.status(500).json({ message: error.message || 'Error analyzing job match' });
  }
});

module.exports = router;