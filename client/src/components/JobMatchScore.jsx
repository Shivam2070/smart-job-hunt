import { useState } from 'react';
import axios from 'axios';
import './JobMatchScore.css';

export default function JobMatchScore() {
  const [step, setStep] = useState('resume'); // resume, job, results
  const [resumeFile, setResumeFile] = useState(null);
  const [jobInput, setJobInput] = useState('');
  const [inputType, setInputType] = useState('paste'); // paste or url
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [extractedResumeText, setExtractedResumeText] = useState('');

  const token = localStorage.getItem('token');

  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file');
        return;
      }
      setResumeFile(file);
    }
  };

  const extractPDFText = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://localhost:5000/api/job-match/extract-pdf',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.text;
    } catch (error) {
      console.error('Error extracting PDF:', error);
      alert('Error extracting PDF. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleNextFromResume = async () => {
    if (!resumeFile) {
      alert('Please select a PDF file');
      return;
    }

    const text = await extractPDFText(resumeFile);
    if (text) {
      setExtractedResumeText(text);
      setStep('job');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!extractedResumeText.trim() || !jobInput.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        resumeText: extractedResumeText,
      };

      if (inputType === 'url') {
        payload.jobUrl = jobInput;
      } else {
        payload.jobDescription = jobInput;
      }

      const response = await axios.post(
        'http://localhost:5000/api/job-match/analyze',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysis(response.data.analysis);
      setStep('results');
    } catch (error) {
      console.error('Error analyzing job match:', error);
      alert(error.response?.data?.message || 'Error analyzing job match');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#2ecc71'; // green
    if (percentage >= 60) return '#f39c12'; // orange
    if (percentage >= 40) return '#e74c3c'; // red
    return '#95a5a6'; // gray
  };

  return (
    <div className="job-match-container">
      <h3>🎯 AI Job Match Score</h3>

      {step === 'resume' && (
        <div className="match-step">
          <div className="step-header">
            <h4>Step 1: Upload Your Resume</h4>
            <p>Upload your resume as a PDF file</p>
          </div>

          <div className="step-content">
            <div className="file-upload-area">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeFileChange}
                className="file-input"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="file-label">
                <div className="file-icon">📄</div>
                <div className="file-text">
                  {resumeFile ? (
                    <>
                      <p className="file-name">✅ {resumeFile.name}</p>
                      <p className="file-size">({(resumeFile.size / 1024).toFixed(2)} KB)</p>
                    </>
                  ) : (
                    <>
                      <p className="file-name">Click to upload or drag and drop</p>
                      <p className="file-size">PDF files only</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            <button
              className="next-btn"
              onClick={handleNextFromResume}
              disabled={!resumeFile || loading}
            >
              {loading ? '⏳ Extracting...' : 'Next: Add Job →'}
            </button>
          </div>
        </div>
      )}

      {step === 'job' && (
        <div className="match-step">
          <div className="step-header">
            <h4>Step 2: Job Description</h4>
            <p>Paste job description or link</p>
          </div>

          <div className="step-content">
            <div className="input-toggle">
              <button
                className={`toggle-btn ${inputType === 'paste' ? 'active' : ''}`}
                onClick={() => setInputType('paste')}
              >
                📄 Paste Description
              </button>
              <button
                className={`toggle-btn ${inputType === 'url' ? 'active' : ''}`}
                onClick={() => setInputType('url')}
              >
                🔗 Paste URL
              </button>
            </div>

            {inputType === 'paste' ? (
              <textarea
                placeholder="Paste the job description here..."
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                rows="8"
                className="job-textarea"
              />
            ) : (
              <input
                type="url"
                placeholder="https://example.com/job-posting"
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                className="url-input"
              />
            )}

            <div className="step-buttons">
              <button
                className="back-btn"
                onClick={() => setStep('resume')}
              >
                ← Back
              </button>
              <button
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={!jobInput.trim() || loading}
              >
                {loading ? '🔄 Analyzing...' : '✨ Analyze Match'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'results' && analysis && (
        <div className="match-results">
          {/* Match Score */}
          <div className="match-score-card">
            <div className="score-circle" style={{ borderColor: getMatchColor(analysis.matchPercentage) }}>
              <div className="score-number" style={{ color: getMatchColor(analysis.matchPercentage) }}>
                {analysis.matchPercentage}%
              </div>
              <div className="score-label">Match Score</div>
            </div>
            <div className="score-info">
              <p className="recommendation">{analysis.recommendation}</p>
              <p className="salary">💰 {analysis.salaryEstimate}</p>
            </div>
          </div>

          {/* Matching Skills */}
          <div className="results-section">
            <h4>✅ Your Matching Skills</h4>
            <div className="skills-list">
              {analysis.hasSkills?.map((skill, i) => (
                <span key={i} className="skill-tag matching">{skill}</span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="results-section">
            <h4>❌ Missing Skills to Learn</h4>
            <div className="skills-list">
              {analysis.missingSkills?.map((skill, i) => (
                <span key={i} className="skill-tag missing">{skill}</span>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="results-section">
            <h4>💪 Your Strengths</h4>
            <ul className="list">
              {analysis.strengths?.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="results-section">
            <h4>⚠️ Areas to Improve</h4>
            <ul className="list">
              {analysis.weaknesses?.map((weakness, i) => (
                <li key={i}>{weakness}</li>
              ))}
            </ul>
          </div>

          {/* Learning Path */}
          <div className="results-section">
            <h4>🗺️ Recommended Learning Path</h4>
            <ol className="list">
              {analysis.learningPath?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="result-buttons">
            <button
              className="restart-btn"
              onClick={() => {
                setStep('resume');
                setResumeFile(null);
                setJobInput('');
                setAnalysis(null);
                setExtractedResumeText('');
              }}
            >
              ← Analyze Another Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}