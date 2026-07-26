import { useState } from 'react';
import axios from 'axios';
import './EditProfile.css';

export default function EditProfile({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    contactNumber: user?.contactNumber || '',
    highestQualification: user?.highestQualification || '',
    employmentStatus: user?.employmentStatus || '',
    skills: user?.skills ? user.skills.join(', ') : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        'https://smart-job-hunt.onrender.com/api/auth/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess(response.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h3>✏️ Edit Profile</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g., +1-234-567-8900"
            />
          </div>

          <div className="form-group">
            <label>Highest Qualification</label>
            <select
              name="highestQualification"
              value={formData.highestQualification}
              onChange={handleChange}
            >
              <option value="">Select qualification</option>
              <option value="High School">High School</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Diploma">Diploma</option>
              <option value="Certification">Certification</option>
            </select>
          </div>

          <div className="form-group">
            <label>Employment Status</label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
            >
              <option value="">Select status</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Student">Student</option>
              <option value="Self-Employed">Self-Employed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., JavaScript, React, Node.js, MongoDB"
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}