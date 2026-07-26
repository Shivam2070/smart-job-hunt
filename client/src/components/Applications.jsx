import { useState, useEffect } from 'react';
import axios from 'axios';
import './Applications.css';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    status: 'Applied',
    interviewDate: '',
    notes: '',
    jobUrl: '',
    salary: '',
  });

  const token = localStorage.getItem('token');

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/applications', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        jobTitle: '',
        company: '',
        status: 'Applied',
        interviewDate: '',
        notes: '',
        jobUrl: '',
        salary: '',
      });
      setShowForm(false);
      fetchApplications();
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`http://localhost:5000/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': '#667eea',
      'Reviewing': '#f39c12',
      'Interview Scheduled': '#2ecc71',
      'Offer Received': '#27ae60',
      'Rejected': '#e74c3c',
      'Withdrawn': '#95a5a6',
    };
    return colors[status] || '#667eea';
  };

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h3>My Applications ({applications.length})</h3>
        <button 
          className="add-application-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close' : '+ Add Application'}
        </button>
      </div>

      {/* Add Application Form */}
      {showForm && (
        <div className="add-application-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Salary (Optional)"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option>Applied</option>
                <option>Reviewing</option>
                <option>Interview Scheduled</option>
                <option>Offer Received</option>
                <option>Rejected</option>
                <option>Withdrawn</option>
              </select>
            </div>

            <div className="form-row">
              <input
                type="date"
                placeholder="Interview Date"
                value={formData.interviewDate}
                onChange={(e) => setFormData({...formData, interviewDate: e.target.value})}
              />
              <input
                type="url"
                placeholder="Job URL"
                value={formData.jobUrl}
                onChange={(e) => setFormData({...formData, jobUrl: e.target.value})}
              />
            </div>

            <textarea
              placeholder="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            ></textarea>

            <button type="submit" className="submit-btn">Add Application</button>
          </form>
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <p className="loading-text">Loading applications...</p>
      ) : applications.length > 0 ? (
        <div className="applications-list">
          {applications.map((app) => (
            <div key={app._id} className="application-card">
              <div className="app-main">
                <div className="app-info">
                  <h4>{app.jobTitle}</h4>
                  <p className="company">{app.company}</p>
                  {app.salary && <p className="salary">💰 {app.salary}</p>}
                </div>
                <div className="app-status">
                  <select 
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                    className="status-select"
                    style={{ borderColor: getStatusColor(app.status) }}
                  >
                    <option className='opt'>Applied</option>
                    <option className='opt'>Reviewing</option>
                    <option className='opt'>Interview Scheduled</option>
                    <option className='opt'>Offer Received</option>
                    <option className='opt'>Rejected</option>
                    <option className='opt'>Withdrawn</option>
                  </select>
                </div>
              </div>

              <div className="app-details">
                <p>📅 Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                {app.interviewDate && (
                  <p>🗓️ Interview: {new Date(app.interviewDate).toLocaleDateString()}</p>
                )}
                {app.notes && <p>📝 {app.notes}</p>}
              </div>

              <div className="app-actions">
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                    View Job
                  </a>
                )}
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(app._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-applications">
          <p>No applications yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}