 import { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'

const atsKeywords = [
  'react', 'javascript', 'node', 'express', 'mongodb', 'api', 'sql', 'python',
  'cloud', 'aws', 'docker', 'communication', 'leadership', 'analytics', 'testing'
]

const getOfflineAtsReview = (resumeText, targetJob) => {
  const normalizedResume = resumeText.toLowerCase()
  const normalizedJob = targetJob.toLowerCase()
  const keywordsToCheck = atsKeywords.filter((keyword) => normalizedJob.includes(keyword))
  const finalKeywords = keywordsToCheck.length ? keywordsToCheck : atsKeywords.slice(0, 8)
  const matchedKeywords = finalKeywords.filter((keyword) => normalizedResume.includes(keyword))
  const missingKeywords = finalKeywords.filter((keyword) => !normalizedResume.includes(keyword)).slice(0, 6)
  const atsScore = Math.min(94, Math.max(45, 50 + matchedKeywords.length * 7 + (resumeText.length > 700 ? 10 : 0)))

  return {
    provider: 'Offline helper',
    atsScore,
    summary: atsScore >= 75
      ? 'Your resume looks ATS friendly. Still, add more measurable achievements and exact job keywords for better ranking.'
      : 'Your resume needs better keyword matching. Add exact skills/tools from the target job description.',
    matchedKeywords,
    missingKeywords,
    improvements: [
      'Add a clear skills section with exact job keywords.',
      'Use bullet points with numbers, tools, and project impact.',
      'Keep formatting simple with headings, bullets, and readable job titles.'
    ],
    suggestedHeadline: matchedKeywords.length
      ? `${matchedKeywords.slice(0, 3).join(' / ')} focused candidate with project impact`
      : 'Job-ready candidate with practical project experience'
  }
}

const AiTools = () => {
  const { backendUrl } = useContext(AppContext)

  const [resumeText, setResumeText] = useState('')
  const [targetJob, setTargetJob] = useState('')
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      return toast.error('Resume text paste karo')
    }

    if (!backendUrl) {
      setReview(getOfflineAtsReview(resumeText, targetJob))
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post(backendUrl + '/api/ai/ats-review', {
        resumeText,
        targetJob
      })

      if (data.success) {
        setReview(data.review)
      } else {
        setReview(getOfflineAtsReview(resumeText, targetJob))
      }
    } catch (error) {
      console.error('ATS backend unavailable, using offline review:', error.message)
      setReview(getOfflineAtsReview(resumeText, targetJob))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className='container 2xl:px-20 mx-auto px-4 py-10 min-h-[70vh]'>
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6 md:p-10 mb-8'>
          <p className='text-sm font-semibold text-blue-700'>AI Tools</p>
          <h1 className='text-3xl md:text-4xl font-semibold text-gray-800 mt-2'>ATS Resume Checker & Career Helper</h1>
          <p className='text-gray-600 mt-3 max-w-3xl'>
            Resume text paste karo, target job role add karo, aur AI se ATS score, missing keywords,
            improvement tips, aur profile headline suggestion lo.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-6'>
          <div className='bg-white border rounded-xl p-5 shadow-sm'>
            <label className='font-semibold text-gray-800'>Paste Resume Text</label>
            <textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              className='w-full min-h-64 border rounded-lg p-4 mt-3 outline-blue-500 text-sm'
              placeholder='Apna resume text yahan paste karo...'
            />

            <label className='font-semibold text-gray-800 mt-5 block'>Target Job / Role</label>
            <textarea
              value={targetJob}
              onChange={(event) => setTargetJob(event.target.value)}
              className='w-full min-h-32 border rounded-lg p-4 mt-3 outline-blue-500 text-sm'
              placeholder='Example: React Developer role requiring React, Node.js, MongoDB...'
            />

            <button
              onClick={analyzeResume}
              disabled={loading}
              className='mt-5 bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg'
            >
              {loading ? 'AI analyzing...' : 'Check ATS Score'}
            </button>
          </div>

          <div className='bg-white border rounded-xl p-5 shadow-sm'>
            <h2 className='text-xl font-semibold text-gray-800'>AI Result</h2>

            {review ? (
              <div className='mt-5 space-y-5'>
                <div className='flex flex-wrap items-center gap-3'>
                  <span className='bg-blue-50 text-blue-700 border border-blue-200 px-5 py-3 rounded-full font-semibold'>
                    ATS Score: {review.atsScore}%
                  </span>
                  <span className='text-xs text-gray-500'>Powered by {review.provider}</span>
                </div>

                <p className='text-gray-700'>{review.summary}</p>

                <div className='bg-gray-50 border rounded-lg p-4'>
                  <h3 className='font-semibold text-gray-800'>Suggested Headline</h3>
                  <p className='text-gray-700 mt-2'>{review.suggestedHeadline}</p>
                </div>

                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='border rounded-lg p-4'>
                    <h3 className='font-semibold text-green-700'>Matched Keywords</h3>
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {review.matchedKeywords?.length ? review.matchedKeywords.map((keyword, index) => (
                        <span key={index} className='bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm'>{keyword}</span>
                      )) : <p className='text-sm text-gray-500'>No matched keywords yet.</p>}
                    </div>
                  </div>

                  <div className='border rounded-lg p-4'>
                    <h3 className='font-semibold text-red-700'>Missing Keywords</h3>
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {review.missingKeywords?.length ? review.missingKeywords.map((keyword, index) => (
                        <span key={index} className='bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm'>{keyword}</span>
                      )) : <p className='text-sm text-gray-500'>Good keyword coverage.</p>}
                    </div>
                  </div>
                </div>

                <div className='border rounded-lg p-4'>
                  <h3 className='font-semibold text-orange-700'>Improve Resume</h3>
                  <ul className='list-disc pl-5 mt-3 space-y-2 text-gray-700'>
                    {review.improvements?.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className='mt-6 text-gray-500 bg-gray-50 border rounded-lg p-6'>
                ATS result yahan show hoga. Resume text paste karke “Check ATS Score” click karo.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default AiTools