const express = require('express');
const axios = require('axios');
const Job = require('../models/Job');

const router = express.Router();

// Fetch jobs from RemoteOK API
router.get('/search', async (req, res) => {
  try {
    console.log('Fetching jobs from RemoteOK...');
    
    const response = await axios.get('https://remoteok.io/api');
    
    if (!response.data) {
      return res.status(404).json({ message: 'No jobs found' });
    }

    // Map RemoteOK data to our format
    const jobs = response.data.slice(0, 50).map(job => ({
      title: job.title,
      company: job.company,
      location: job.location || 'Remote',
      salary: job.salary || 'Not specified',
      description: job.description || '',
      jobUrl: job.url,
      source: 'remoteok',
      tags: job.tag ? [job.tag] : [],
      posted_at: job.date || new Date(),
    }));

    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Search jobs by keyword
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    
    const response = await axios.get('https://remoteok.io/api');
    
    const jobs = response.data
      .filter(job => 
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(keyword.toLowerCase())
      )
      .slice(0, 50)
      .map(job => ({
        title: job.title,
        company: job.company,
        location: job.location || 'Remote',
        salary: job.salary || 'Not specified',
        description: job.description || '',
        jobUrl: job.url,
        source: 'remoteok',
        tags: job.tag ? [job.tag] : [],
        posted_at: job.date || new Date(),
      }));

    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs,
    });
  } catch (error) {
    console.error('Error searching jobs:', error.message);
    res.status(500).json({ message: 'Error searching jobs' });
  }
});

module.exports = router;