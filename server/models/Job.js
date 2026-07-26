const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    salary: String,
    description: String,
    jobUrl: String,
    source: String, // 'remoteok', 'jooble', etc
    tags: [String],
    posted_at: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);