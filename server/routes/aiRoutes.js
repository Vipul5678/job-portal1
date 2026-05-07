 import express from 'express'
import { chatWithAssistant, getAtsReview, getJobAdvice } from '../controllers/aiController.js'

const router = express.Router()

router.post('/job-advice', getJobAdvice)
router.post('/ats-review', getAtsReview)
router.post('/chat', chatWithAssistant)

export default router