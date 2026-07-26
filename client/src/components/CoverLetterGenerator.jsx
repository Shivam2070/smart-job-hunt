import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './CoverLetterGenerator.css';

export default function CoverLetterGenerator() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    yourName: '',
    yourExperience: '',
    keySkills: '',
  });
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    
    if (!formData.jobTitle.trim() || !formData.company.trim() || !formData.yourName.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cover-letter/generate',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCoverLetter(response.data);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert(error.response?.data?.message || 'Error generating cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const downloadAsPDF = () => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Add title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${coverLetter.job.company} - ${coverLetter.job.title}`, margin, yPosition);
      yPosition += 10;

      // Add date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const today = new Date().toLocaleDateString();
      doc.text(`Date: ${today}`, margin, yPosition);
      yPosition += 10;

      // Add cover letter content with proper formatting
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(coverLetter.coverLetter, maxWidth);
      
      lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Save the PDF
      doc.save(`${coverLetter.job.company}-${coverLetter.job.title}-cover-letter.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter.coverLetter);
    alert('✅ Cover letter copied to clipboard!');
  };

  return (
    <div className="cover-letter-container">
      <h3>📝 AI Cover Letter Generator</h3>

      <div className="cover-letter-content">
        {!coverLetter ? (
          <form onSubmit={handleGenerateCoverLetter} className="cover-letter-form">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                placeholder="e.g., Senior Full Stack Developer"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                name="company"
                placeholder="e.g., Google, Microsoft, Startup Inc."
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="yourName"
                placeholder="Your full name"
                value={formData.yourName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="text"
                  name="yourExperience"
                  placeholder="e.g., 5 years, 2+ years, Fresher"
                  value={formData.yourExperience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Key Skills</label>
                <input
                  type="text"
                  name="keySkills"
                  placeholder="e.g., JavaScript, React, Node.js, AWS"
                  value={formData.keySkills}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="generate-btn"
              disabled={loading}
            >
              {loading ? '✍️ Generating Cover Letter...' : '✨ Generate Cover Letter'}
            </button>
          </form>
        ) : (
          <div className="cover-letter-display">
            <div className="letter-header">
              <h4>{coverLetter.job.company} - {coverLetter.job.title}</h4>
              <button
                className="back-btn"
                onClick={() => setCoverLetter(null)}
              >
                ← Create Another
              </button>
            </div>

            <div className="letter-content">
              {coverLetter.coverLetter.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="letter-actions">
              <button
                className="download-btn"
                onClick={downloadAsPDF}
              >
                📥 Download as PDF
              </button>
              <button
                className="copy-btn"
                onClick={copyToClipboard}
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}