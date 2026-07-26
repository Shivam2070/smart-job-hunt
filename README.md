# 🎯 Smart Job Hunt Companion

An AI-powered job search platform built with MERN stack. Your ultimate career companion!

## 🚀 Features

### Core Features (8/20)
1. **🔐 Authentication** - Secure signup/login with JWT
2. **📋 Dashboard** - Beautiful glassmorphism UI with profile stats
3. **💼 Job Search** - Search 50+ live remote jobs
4. **📝 Application Tracker** - Track all your job applications
5. **📄 Resume Analyzer** - AI analyzes your resume with ATS score
6. **🤖 AI Career Coach** - Chat with AI for career advice
7. **🗺️ Career Roadmap** - Personalized learning paths
8. **📝 Cover Letter Generator** - AI-generated professional cover letters
9. **🎯 Job Match Score** - Analyze resume-job fit percentage

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS + Custom CSS
- Axios for API calls
- React Markdown for formatting

**Backend:**
- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Groq AI API

**AI/APIs:**
- Groq LLM (Resume Analysis, Chatbot, Roadmap, Cover Letter, Job Match)
- RemoteOK API (Job listings)

## 📦 Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free)

### Backend Setup

```bash
cd smart-job-hunt/server
npm install

# Create .env file
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
GROQ_API_KEY=your_groq_api_key
```

### Frontend Setup

```bash
cd smart-job-hunt/client
npm install
npm run dev
```

## 🚀 Running the Application

**Terminal 1 (Backend):**
```bash
cd smart-job-hunt/server
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd smart-job-hunt/client
npm run dev
```

Access at: `http://localhost:5173`

## 📋 Project Structure


## 🎯 How to Use

### 1. Sign Up / Login
- Create a new account with email and password
- Secure JWT authentication

### 2. Search Jobs
- Browse 50+ remote job listings
- Filter by keywords
- View job details

### 3. Track Applications
- Add applications manually
- Update status (Applied, Interview, Offer, Rejected)
- Track interview dates

### 4. Upload Resume
- Upload PDF resume
- AI analyzes for ATS compatibility
- Get score and improvement suggestions

### 5. AI Career Coach
- Chat with AI for career advice
- Get interview tips
- Ask about salary negotiation
- Get LinkedIn optimization advice

### 6. Generate Roadmap
- Input current skills and target role
- Get personalized learning path
- Month-by-month breakdown

### 7. Generate Cover Letter
- Fill job details
- Get AI-generated cover letter
- Download as PDF

### 8. Job Match Score
- Upload resume (PDF)
- Paste job description or URL
- Get match percentage
- See missing skills
- Get salary estimate
- See learning recommendations

## 🔑 Key Environment Variables

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=gsk_your_groq_key_here
PORT=5000

## 📚 Dependencies

**Backend:**
- express
- mongoose
- jsonwebtoken
- bcryptjs
- groq-sdk
- axios
- pdf2json
- multer
- cheerio

**Frontend:**
- react
- axios
- react-markdown
- jspdf

## 🎓 Learning Path

This project demonstrates:
- Full-stack MERN development
- JWT authentication
- AI API integration
- PDF processing
- Real-time chat functionality
- Beautiful UI with Glassmorphism
- Responsive design

## 🚀 Future Features

- [ ] Interview scheduler
- [ ] Salary insights dashboard
- [ ] Networking tracker
- [ ] Skill gap analyzer
- [ ] Interview journal
- [ ] Rejection analyzer
- [ ] LinkedIn profile optimizer
- [ ] Calendar integration

## 📝 License

MIT License - feel free to use this project!

## 👨‍💻 Author

Built during AccioBuild July 2026 Hackathon

---

**Happy job hunting! 🎉**