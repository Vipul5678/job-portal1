 const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const keywordGroups = [
  ['react', 'frontend', 'ui', 'javascript', 'html', 'css'],
  ['node', 'express', 'backend', 'api', 'mongodb', 'database'],
  ['cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes'],
  ['data', 'analytics', 'sql', 'python', 'machine learning', 'ai'],
  ['communication', 'team', 'leadership', 'collaboration', 'problem solving']
]

const commonAtsKeywords = [
  'react', 'javascript', 'node', 'express', 'mongodb', 'api', 'sql', 'python',
  'cloud', 'aws', 'docker', 'communication', 'leadership', 'analytics', 'testing'
]

const extractKeywords = (text = '') => {
  const normalizedText = text.toLowerCase()
  return keywordGroups
    .flat()
    .filter((keyword) => normalizedText.includes(keyword))
}

const extractAtsKeywords = (text = '') => {
  const normalizedText = stripHtml(text).toLowerCase()
  return commonAtsKeywords.filter((keyword) => normalizedText.includes(keyword))
}

const getTextFromGeminiResponse = (data) => data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') || ''

const parseJsonResponse = (text) => {
  const cleanedText = text.replace(/```json|```/g, '').trim()
  const jsonStart = cleanedText.indexOf('{')
  const jsonEnd = cleanedText.lastIndexOf('}')

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('AI response was not valid JSON')
  }

  return JSON.parse(cleanedText.slice(jsonStart, jsonEnd + 1))
}

const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    return null
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  )

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return getTextFromGeminiResponse(data)
}

const getLocalAdvice = ({ job = {}, user = {} }) => {
  const description = stripHtml(job.description)
  const jobText = `${job.title || ''} ${job.category || ''} ${job.level || ''} ${description}`
  const matchedSkills = extractKeywords(jobText)
  const score = Math.min(92, Math.max(58, 62 + matchedSkills.length * 5 + (user.resume ? 8 : 0)))

  const missingSkills = ['portfolio projects', 'measurable achievements', 'role-specific keywords']
    .filter((skill) => !matchedSkills.includes(skill))

  return {
    provider: 'Smart fallback',
    matchScore: score,
    summary: `${user.name || 'Candidate'} looks like a ${score >= 75 ? 'strong' : 'good'} fit for the ${job.title || 'selected'} role. Highlight relevant experience and keep the resume focused on this job description.`,
    strengths: [
      `${job.level || 'Required'} level profile can be positioned well for this opening.`,
      matchedSkills.length ? `Job keywords detected: ${matchedSkills.slice(0, 5).join(', ')}.` : 'Job description has enough information to tailor the application.',
      user.resume ? 'Resume is available, so the application can be submitted confidently.' : 'Upload a resume before applying to improve application strength.'
    ],
    improvements: [
      `Add ${missingSkills[0]} to make the resume more targeted.`,
      'Use 2-3 bullet points with numbers, impact, or project results.',
      `Mention why you want to work at ${job.companyId?.name || 'this company'}.`
    ],
    coverLetter: `Hi ${job.companyId?.name || 'Team'}, I am interested in the ${job.title || 'open'} role in ${job.location || 'your team'}. My background matches the role requirements, and I can contribute with ownership, quick learning, and practical project experience. I would be happy to discuss how I can help your team.`
  }
}

const getLocalAtsReview = ({ resumeText = '', targetJob = '' }) => {
  const resumeKeywords = extractAtsKeywords(resumeText)
  const jobKeywords = extractAtsKeywords(targetJob)
  const keywordsToCheck = jobKeywords.length ? jobKeywords : commonAtsKeywords.slice(0, 8)
  const matchedKeywords = keywordsToCheck.filter((keyword) => resumeKeywords.includes(keyword))
  const missingKeywords = keywordsToCheck.filter((keyword) => !resumeKeywords.includes(keyword)).slice(0, 6)
  const score = Math.min(94, Math.max(45, 50 + matchedKeywords.length * 7 + (resumeText.length > 700 ? 10 : 0)))

  return {
    provider: 'Smart fallback',
    atsScore: score,
    summary: `Your resume is ${score >= 75 ? 'reasonably ATS-friendly' : 'a good start, but needs stronger keyword alignment'}. Add exact role keywords and measurable achievements for better screening performance.`,
    matchedKeywords,
    missingKeywords,
    improvements: [
      'Add a short skills section with exact keywords from the job description.',
      'Use bullet points with numbers, tools, and business impact.',
      'Keep formatting simple: headings, bullets, dates, and readable job titles.'
    ],
    suggestedHeadline: matchedKeywords.length
      ? `${matchedKeywords.slice(0, 3).join(' / ')} focused candidate with project impact`
      : 'Job-ready candidate with practical project experience'
  }
}

const getLocalChatReply = ({ message = '', job = {}, user = {} }) => {
  const lowerMessage = message.toLowerCase()
  const name = user?.name || 'Candidate'

  if (lowerMessage.match(/^(hi|hii|hello|hey|hyy|hy|namaste|hello ai)$/i)) {
    return `Hi ${name}! Main aapka AI career assistant hoon. Aap resume ATS, job apply, interview prep, skills roadmap, projects, ya salary negotiation ke baare me pooch sakte ho.`
  }

  if (lowerMessage.includes('ats') || lowerMessage.includes('score')) {
    return 'ATS improve karne ke liye job description ke exact keywords resume me add karo, simple formatting rakho, tables/images avoid karo, aur skills + project impact clearly mention karo.'
  }

  if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
    return 'Resume me summary, skills, projects, experience, education sections rakho. Bullet points me action verbs, tools, aur measurable impact likho. Har job ke liye keywords customize karo.'
  }

  if (lowerMessage.includes('apply') || lowerMessage.includes('job')) {
    return `Job apply karne se pehle role ke skills match karo, resume update karo, then Apply Now click karo. ${user?.resume ? 'Aapka resume available hai, application stronger rahegi.' : 'Resume upload karna mat bhoolna.'}`
  }

  if (lowerMessage.includes('interview')) {
    return 'Interview prep ke liye company research, job description ke top 5 skills, 2 strong projects, aur STAR method answers ready rakho. Intro 60 seconds me crisp practice karo.'
  }

  if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('roadmap')) {
    return 'Web career roadmap: HTML/CSS, JavaScript, React, Node/Express, MongoDB, Git/GitHub, deployment. Har skill par ek practical project banao.'
  }

  if (lowerMessage.includes('project')) {
    return 'Portfolio projects me auth, CRUD, search/filter, dashboard, upload, and deployment add karo. README me live link, screenshots, tech stack aur features likho.'
  }

  return `Main aapka AI career helper hoon. Aap resume, ATS score, job apply, interview prep, skills roadmap, ya ${job?.title || 'job search'} ke baare me specific question pooch sakte ho.`
}

export const getJobAdvice = async (req, res) => {
  const { job, user } = req.body
  const fallbackAdvice = getLocalAdvice({ job, user })

  try {
    const aiText = await callGemini(`You are an AI career coach for a job portal. Return only valid JSON with these keys: provider, matchScore, summary, strengths, improvements, coverLetter. strengths and improvements must be arrays of 3 short strings. matchScore must be a number from 0 to 100.\n\nCandidate:\nName: ${user?.name || 'Candidate'}\nEmail: ${user?.email || 'Not provided'}\nHas resume: ${user?.resume ? 'Yes' : 'No'}\n\nJob:\nTitle: ${job?.title || ''}\nCompany: ${job?.companyId?.name || ''}\nLocation: ${job?.location || ''}\nLevel: ${job?.level || ''}\nCategory: ${job?.category || ''}\nSalary: ${job?.salary || ''}\nDescription: ${stripHtml(job?.description || '').slice(0, 2000)}`)

    if (!aiText) {
      return res.json({ success: true, advice: fallbackAdvice })
    }

    const aiAdvice = parseJsonResponse(aiText)

    return res.json({
      success: true,
      advice: {
        ...fallbackAdvice,
        ...aiAdvice,
        provider: aiAdvice.provider || 'Gemini AI'
      }
    })
  } catch (error) {
    console.error('AI advice failed, using smart fallback:', error.message)
    return res.json({ success: true, advice: fallbackAdvice })
  }
}

export const getAtsReview = async (req, res) => {
  const { resumeText, targetJob } = req.body
  const fallbackReview = getLocalAtsReview({ resumeText, targetJob })

  try {
    const aiText = await callGemini(`You are an ATS resume reviewer for a job portal. Return only valid JSON with these keys: provider, atsScore, summary, matchedKeywords, missingKeywords, improvements, suggestedHeadline. matchedKeywords, missingKeywords, and improvements must be arrays of short strings. atsScore must be a number from 0 to 100.\n\nResume text:\n${stripHtml(resumeText || '').slice(0, 4000)}\n\nTarget job / role:\n${stripHtml(targetJob || '').slice(0, 2000)}`)

    if (!aiText) {
      return res.json({ success: true, review: fallbackReview })
    }

    const aiReview = parseJsonResponse(aiText)

    return res.json({
      success: true,
      review: {
        ...fallbackReview,
        ...aiReview,
        provider: aiReview.provider || 'Gemini AI'
      }
    })
  } catch (error) {
    console.error('ATS review failed, using smart fallback:', error.message)
    return res.json({ success: true, review: fallbackReview })
  }
}

export const chatWithAssistant = async (req, res) => {
  const { message, job, user } = req.body

  if (!message?.trim()) {
    return res.json({ success: false, message: 'Please type a question first' })
  }

  const fallbackReply = getLocalChatReply({ message, job, user })

  try {
    const aiText = await callGemini(`You are a friendly AI career assistant inside a job portal. Reply in simple Hinglish/Hindi-English when helpful. Keep answer under 120 words. Help with ATS resume, job apply, interview prep, skills, and job suggestions.\n\nCandidate name: ${user?.name || 'Candidate'}\nCurrent job context: ${job?.title || 'No specific job'} at ${job?.companyId?.name || 'company not selected'}\nQuestion: ${message}`)

    return res.json({
      success: true,
      reply: aiText || fallbackReply,
      provider: aiText ? 'Gemini AI' : 'Smart fallback'
    })
  } catch (error) {
    console.error('AI chat failed, using smart fallback:', error.message)
    return res.json({ success: true, reply: fallbackReply, provider: 'Smart fallback' })
  }
}