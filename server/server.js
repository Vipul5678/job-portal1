 const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();


// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));


// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal'
)
.then(() => {
  console.log('✅ MongoDB Connected');
})
.catch((err) => {
  console.log('❌ MongoDB Error:', err);
});


// ROUTES
const recruiterAuthRoutes = require('./routes/recruiterAuth');
const jobRoutes = require('./routes/jobRoutes');
const companyRoutes = require('./routes/companyRoutes');


// Route Use
app.use('/api/recruiter', recruiterAuthRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/company', companyRoutes);


// Test Route
app.get('/', (req, res) => {
  res.send('Backend Running Successfully');
});


// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server Running'
  });
});


// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// Error Middleware
app.use((err, req, res, next) => {
  console.log(err);

  res.status(500).json({
    success: false,
    message: err.message
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});