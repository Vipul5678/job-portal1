const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Recruiter = require('../models/Recruiter');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Sign Up
router.post('/signup', upload.single('logo'), async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;

    // Validation
    if (!name || !email || !password || !company) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and company are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const existingRecruiter = await Recruiter.findOne({ email: email.toLowerCase() });
    if (existingRecruiter) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete uploaded file if exists
      }
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new recruiter
    const newRecruiter = new Recruiter({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      company: company.trim(),
      phone: phone ? phone.trim() : '',
      logo: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newRecruiter.save();

    // Generate token
    const token = jwt.sign(
      { id: newRecruiter._id, email: newRecruiter.email, role: 'recruiter' },
      process.env.JWT_SECRET || 'your-secret-key-12345',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: token,
      recruiter: {
        id: newRecruiter._id,
        name: newRecruiter.name,
        email: newRecruiter.email,
        company: newRecruiter.company,
        logo: newRecruiter.logo
      }
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path); // Delete uploaded file if error occurs
    }
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Sign up failed',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find recruiter by email
    const recruiter = await Recruiter.findOne({ email: email.toLowerCase() }).select('+password');
    if (!recruiter) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, recruiter.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: recruiter._id, email: recruiter.email, role: 'recruiter' },
      process.env.JWT_SECRET || 'your-secret-key-12345',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company,
        logo: recruiter.logo
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get recruiter profile (protected route example)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-12345');
    const recruiter = await Recruiter.findById(decoded.id);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    res.status(200).json({
      success: true,
      recruiter: recruiter
    });

  } catch (error) {
    console.error('Profile Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
