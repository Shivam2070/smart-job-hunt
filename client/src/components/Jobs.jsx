import { useState, useEffect } from 'react';
import axios from 'axios';
import './Jobs.css';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchJobs = async (keyword = '') => {
        setLoading(true);
        try {
            const url = keyword
                ? `http://localhost:5000/api/jobs/search/${keyword}`
                : `http://localhost:5000/api/jobs/search`;

            const response = await axios.get(url);
            setJobs(response.data.jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchJobs(searchQuery);
        }
    };

    return (
        <div className="jobs-container">
            {/* Search Bar */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        🔍 Search
                    </button>
                </form>
            </div>

            {/* Jobs Count */}
            <div className="jobs-header">
                <h3>Found {jobs.length} jobs</h3>
            </div>

            {/* Loading */}
            {loading && (
                <div className="loading-state">
                    <p>Loading jobs...</p>
                </div>
            )}

            {/* Jobs Grid */}
            {!loading && jobs.length > 0 && (
                <div className="jobs-grid">
                    {jobs.map((job, index) => (
                        <div key={index} className="job-card">
                            <div className="job-header">
                                <div>
                                    <h4 className="job-title">{job.title}</h4>
                                    <p className="job-company">{job.company}</p>
                                </div>
                            </div>

                            <div className="job-details">
                                <span className="job-location">📍 {job.location}</span>
                                <span className="job-salary">💰 {job.salary}</span>
                            </div>

                            <p className="job-description">
                                {job.description
                                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                                    .substring(0, 150)}
                                ...
                            </p>

                            <div className="job-tags">
                                {job.tags.map((tag, i) => (
                                    <span key={i} className="tag">{tag}</span>
                                ))}
                            </div>

                            <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="apply-btn"
                            >
                                View Job →
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* No Jobs */}
            {!loading && jobs.length === 0 && (
                <div className="empty-state">
                    <p>No jobs found. Try a different search!</p>
                </div>
            )}
        </div>
    );
}