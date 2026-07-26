import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Jobs from './Jobs';
import Applications from './Applications';
import ResumeAnalyzer from './ResumeAnalyzer';
import Chatbot from './Chatbot';
import RoadmapGenerator from './RoadmapGenerator';
import CoverLetterGenerator from './CoverLetterGenerator';
import JobMatchScore from './JobMatchScore';
import EditProfile from './EditProfile';

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
  });
  const [showEditProfile, setShowEditProfile] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('https://smart-job-hunt.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch applications count
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('https://smart-job-hunt.onrender.com/api/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Count applications by status
        const apps = response.data;
        const interviews = apps.filter(app => 
          app.status === 'Interview Scheduled' || app.status === 'Offer Received'
        ).length;
        const offers = apps.filter(app => app.status === 'Offer Received').length;

        setStats({
          applications: apps.length,
          interviews: interviews,
          offers: offers,
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (activeTab === 'profile') {
      fetchApplications();
    }
  }, [activeTab, token]);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Smart Job Hunt</h1>
          <p>Your AI Career Companion</p>
        </div>
        <div className="dashboard-header-right">
          <span>👋 {user?.name}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Welcome Back, {user?.name}! 🚀</h2>
          <p>Get ready to discover your next great opportunity</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            📋 Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            💼 Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📝 Applications
          </button>
          <button
            className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            📄 Resume
          </button>
          <button
            className={`tab-btn ${activeTab === 'chatbot' ? 'active' : ''}`}
            onClick={() => setActiveTab('chatbot')}
          >
            🤖 AI Coach
          </button>
          <button
            className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            🗺️ Roadmap
          </button>
          <button
            className={`tab-btn ${activeTab === 'coverLetter' ? 'active' : ''}`}
            onClick={() => setActiveTab('coverLetter')}
          >
            📝 Cover Letter
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobMatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobMatch')}
          >
            🎯 Job Match
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-grid">
            <div className="profile-card">
              <h3>📋 Profile Information</h3>
              <div className="profile-field">
                <label>Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-field">
                <label>Contact Number</label>
                <p>{user?.contactNumber || 'Not added'}</p>
              </div>
              <div className="profile-field">
                <label>Highest Qualification</label>
                <p>{user?.highestQualification || 'Not added'}</p>
              </div>
              <div className="profile-field">
                <label>Employment Status</label>
                <p>{user?.employmentStatus || 'Not added'}</p>
              </div>
              <div className="profile-field">
                <label>Skills</label>
                <div className="skills-display">
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, i) => (
                      <span key={i} className="skill-badge">{skill}</span>
                    ))
                  ) : (
                    <p>No skills added</p>
                  )}
                </div>
              </div>
              <button 
                className="edit-btn"
                onClick={() => setShowEditProfile(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.applications}</div>
                <div className="stat-label">Applications</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.interviews}</div>
                <div className="stat-label">Interviews</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.offers}</div>
                <div className="stat-label">Offers</div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && <Jobs />}

        {/* Applications Tab */}
        {activeTab === 'applications' && <Applications />}

        {/* Resume Tab */}
        {activeTab === 'resume' && <ResumeAnalyzer />}

        {/* Chatbot Tab */}
        {activeTab === 'chatbot' && <Chatbot />}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && <RoadmapGenerator />}

        {/* Cover Letter Tab */}
        {activeTab === 'coverLetter' && <CoverLetterGenerator />}

        {/* Job Match Tab */}
        {activeTab === 'jobMatch' && <JobMatchScore />}
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && user && (
        <EditProfile 
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
            setShowEditProfile(false);
          }}
        />
      )}
    </div>
  );
}