 import Company from '../models/Company.js'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from '../utils/generateToken.js'
import Job from '../models/Job.js'
import JobApplication from '../models/JobApplication.js'

// Register Company
export const registerCompany = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const imageFile = req.file

        if (!name || !email || !password || !imageFile) {
            return res.json({ success: false, message: 'All fields including image are required' })
        }

        const existingCompany = await Company.findOne({ email })

        if (existingCompany) {
            return res.json({ success: false, message: 'Company already registered with this email' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url
        })

        const token = generateToken(company._id)

        res.json({
            success: true,
            token,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            }
        })

    } catch (error) {
        console.log('Register Company Error:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and Password are required' })
        }

        const company = await Company.findOne({ email })

        if (!company) {
            return res.json({ success: false, message: 'Company not found' })
        }

        const isMatch = await bcrypt.compare(password, company.password)

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' })
        }

        const token = generateToken(company._id)

        res.json({
            success: true,
            token,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            }
        })

    } catch (error) {
        console.log('Company Login Error:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get Company Data
export const getCompanyData = async (req, res) => {
    try {
        const company = req.company
        res.json({ success: true, company })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Post a Job
export const postJob = async (req, res) => {
    try {
        const { title, description, location, salary, category, level } = req.body

        const companyId = req.company._id

        if (!title || !description || !location || !salary || !category || !level) {
            return res.json({ success: false, message: 'All fields are required' })
        }

        const job = await Job.create({
            title,
            description,
            location,
            salary,
            category,
            level,
            companyId,
            date: Date.now()
        })

        res.json({ success: true, message: 'Job posted successfully', job })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {
        const companyId = req.company._id

        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name email image resume')
            .populate('jobId', 'title location category level')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {
        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        const jobsData = await Promise.all(
            jobs.map(async (job) => {
                const applicants = await JobApplication.find({ jobId: job._id })
                return { ...job.toObject(), applicants: applicants.length }
            })
        )

        res.json({ success: true, jobsData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Application Status
export const ChangeJobApplicationsStatus = async (req, res) => {
    try {
        const { id, status } = req.body

        await JobApplication.findByIdAndUpdate(id, { status })

        res.json({ success: true, message: 'Status updated successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Visibility
export const changeVisiblity = async (req, res) => {
    try {
        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible
        }

        await job.save()

        res.json({ success: true, message: 'Job visibility updated', job })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}