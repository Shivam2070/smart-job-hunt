import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './RoadmapGenerator.css';

export default function RoadmapGenerator() {
  const [formData, setFormData] = useState({
    currentSkills: '',
    targetRole: '',
    experience: '',
    timeframe: '6-12 months',
  });
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    
    if (!formData.currentSkills.trim() || !formData.targetRole.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/roadmap/generate',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoadmap(response.data.roadmap);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert(error.response?.data?.message || 'Error generating roadmap');
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

  return (
    <div className="roadmap-container">
      <h3>🗺️ AI Career Roadmap Generator</h3>

      <div className="roadmap-content">
        {!roadmap ? (
          <form onSubmit={handleGenerateRoadmap} className="roadmap-form">
            <div className="form-group">
              <label>Current Skills *</label>
              <textarea
                name="currentSkills"
                placeholder="e.g., JavaScript, React, Node.js, basic SQL"
                value={formData.currentSkills}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Target Role *</label>
              <input
                type="text"
                name="targetRole"
                placeholder="e.g., Full Stack Developer, Product Manager, Data Scientist"
                value={formData.targetRole}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g., 2 years, Entry-level, 5+ years"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Timeframe</label>
                <select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleInputChange}
                >
                  <option>3 months</option>
                  <option>6 months</option>
                  <option>6-12 months</option>
                  <option>1 year</option>
                  <option>1-2 years</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="generate-btn"
              disabled={loading}
            >
              {loading ? '🔄 Generating Roadmap...' : '✨ Generate My Roadmap'}
            </button>
          </form>
        ) : (
          <div className="roadmap-display">
            <button
              className="back-btn"
              onClick={() => setRoadmap(null)}
            >
              ← Create New Roadmap
            </button>

            <div className="roadmap-content-markdown">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1>{children}</h1>,
                  h2: ({ children }) => <h2>{children}</h2>,
                  h3: ({ children }) => <h3>{children}</h3>,
                  p: ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => <ul>{children}</ul>,
                  ol: ({ children }) => <ol>{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  strong: ({ children }) => <strong>{children}</strong>,
                  em: ({ children }) => <em>{children}</em>,
                  code: ({ children }) => <code>{children}</code>,
                  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                }}
              >
                {roadmap}
              </ReactMarkdown>
            </div>

            <button
              className="export-btn"
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([roadmap], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = 'career-roadmap.txt';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              📥 Download Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}