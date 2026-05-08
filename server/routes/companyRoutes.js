 const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// ADD JOB
router.post('/post-job', async (req, res) => {
  try {

    const {
      title,
      description,
      location,
      salary,
      category,
      level
    } = req.body;

    // Validation
    if (!title || !description || !location || !salary || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create Job
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      category,
      level,
      visible: true
    });

    await newJob.save();

    res.json({
      success: true,
      message: 'Job added successfully',
      job: newJob
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;