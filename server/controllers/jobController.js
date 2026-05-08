 const mongoose = require('mongoose');
const Job = require('../models/Job');

// Get All Jobs
const getJobs = async (req, res) => {

    try {

        const jobs = await Job.find({ visible: true });

        res.json({
            success: true,
            jobs
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get Single Job
const getJobById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.json({
                success: false,
                message: 'Job not found'
            });
        }

        const job = await Job.findById(id);

        if (!job) {

            return res.json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            job
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

// Add Job
const addJob = async (req, res) => {

    try {

        const {
            title,
            description,
            location,
            salary,
            category,
            level
        } = req.body;

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
            message: 'Job Added Successfully'
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getJobs,
    getJobById,
    addJob
};