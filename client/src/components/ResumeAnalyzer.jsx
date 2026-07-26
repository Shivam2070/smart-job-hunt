import { useState, useEffect } from 'react';
import axios from 'axios';
import './ResumeAnalyzer.css';

export default function ResumeAnalyzer() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resume', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/resume/analyze', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysis(response.data.resume);
      setSelectedFile(null);
      document.querySelector('.file-input').value = '';
      fetchResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert(error.response?.data?.message || 'Error analyzing resume. Make sure it\'s a valid PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resume?')) {
      try {
        await axios.delete(`http://localhost:5000/api/resume/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchResumes();
        setAnalysis(null);
      } catch (error) {
        console.error('Error deleting resume:', error);
      }
    }
  };

  return (
    <div className="resume-analyzer-container">
      <h3>📄 Resume Analyzer</h3>

      {/* Upload Section */}
      <div className="upload-section">
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="file-input"
            required
          />
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="upload-btn"
          >
            {uploading ? '⏳ Analyzing...' : '📤 Upload & Analyze'}
          </button>
        </form>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results">
          <div className="ats-score-card">
            <div className="score-circle">
              <div className="score-value">{analysis.atsScore}</div>
              <div className="score-label">ATS Score</div>
            </div>
            <p className="score-feedback">{analysis.feedback}</p>
          </div>

          {/* Keywords */}
          <div className="analysis-section">
            <h4>🎯 Top Keywords Found</h4>
            <div className="keywords-list">
              {analysis.keywords.map((keyword, i) => (
                <span key={i} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="analysis-section">
            <h4>💡 Improvement Suggestions</h4>
            <ul className="suggestions-list">
              {analysis.suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Previous Resumes */}
      {!loading && resumes.length > 0 && (
        <div className="previous-resumes">
          <h4>📋 Your Analyzed Resumes</h4>
          {resumes.map((resume) => (
            <div key={resume._id} className="resume-item">
              <div>
                <p className="resume-name">{resume.fileName}</p>
                <p className="resume-date">
                  {new Date(resume.analyzedAt).toLocaleDateString()}
                </p>
                <p className="resume-score">Score: {resume.atsScore}/100</p>
              </div>
              <button
                className="delete-resume-btn"
                onClick={() => handleDelete(resume._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && resumes.length === 0 && !analysis && (
        <div className="empty-state">
          <p>Upload your PDF resume to get started!</p>
        </div>
      )}
    </div>
  );
}