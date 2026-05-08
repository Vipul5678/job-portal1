 const express = require('express');

const {
    getJobById,
    getJobs,
    addJob
} = require('../controllers/jobController');

const router = express.Router();

// Get all jobs
router.get('/', getJobs);

// Get single job
router.get('/:id', getJobById);

// Add new job
router.post('/add', addJob);

module.exports = router;