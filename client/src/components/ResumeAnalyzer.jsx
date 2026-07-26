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
      const response = await axios.get('https://smart-job-hunt.onrender.com/api/resume', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only');
        return;
      }
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      console.log('Starting upload...');
      const response = await axios.post(
        'https://smart-job-hunt.onrender.com/api/resume/analyze',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload successful:', response.data);
      setAnalysis(response.data.resume);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
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
        await axios.delete(`https://smart-job-hunt.onrender.com/api/resume/${id}`, {
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
          <div className="file-input-wrapper">
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <label htmlFor="file-input" className="file-input-label">
              <div className="file-icon">📤</div>
              <div className="file-text">
                {selectedFile ? (
                  <>
                    <p className="file-name">✅ {selectedFile.name}</p>
                    <p className="file-size">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                  </>
                ) : (
                  <>
                    <p className="file-name">Click to upload PDF resume</p>
                    <p className="file-size">or drag and drop</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="upload-btn"
            disabled={!selectedFile || uploading}
          >
            {uploading ? '⏳ Analyzing...' : '✨ Analyze Resume'}
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
              {analysis.keywords?.map((keyword, i) => (
                <span key={i} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="analysis-section">
            <h4>💡 Improvement Suggestions</h4>
            <ul className="suggestions-list">
              {analysis.suggestions?.map((suggestion, i) => (
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