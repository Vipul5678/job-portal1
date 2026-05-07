 import { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const getOfflineReply = (question, userName = 'Candidate') => {
  const message = question.toLowerCase()
  const name = userName || 'Candidate'

  if (message.match(/^(hi|hii|hello|hey|hyy|hy|namaste|hello ai)$/i)) {
    return `Hi ${name}! Main aapka AI career chatbot hoon. Aap mujhse resume ATS score, job apply, interview preparation, skills, salary negotiation, ya career roadmap ke baare me pooch sakte ho.`
  }

  if (message.includes('ats') || message.includes('score')) {
    return 'ATS score improve karne ke liye job description ke exact keywords resume me add karo, simple headings use karo, tables/images avoid karo, aur skills + projects section me tools clearly mention karo.'
  }

  if (message.includes('resume') || message.includes('cv')) {
    return 'Resume ke liye 1-page clean format rakho: summary, skills, projects, experience, education. Har project me tech stack + measurable impact likho, jaise “reduced load time by 30%”.'
  }

  if (message.includes('interview')) {
    return 'Interview prep ke liye 3 cheezein ready rakho: apne 2 best projects, job description ke top skills, aur STAR method answers. Mock interview me introduction 60 seconds ka practice karo.'
  }

  if (message.includes('job') || message.includes('apply')) {
    return 'Job apply karne se pehle role ke required skills compare karo, resume me matching keywords add karo, then apply karo. Har role ke liye same resume mat bhejo — thoda customize karo.'
  }

  if (message.includes('skill') || message.includes('learn') || message.includes('roadmap')) {
    return 'Agar web developer banna hai to roadmap: HTML/CSS → JavaScript → React → Node/Express → MongoDB → Git/GitHub → deployment. Har skill ke saath ek project banana zaroori hai.'
  }

  if (message.includes('salary') || message.includes('package')) {
    return 'Salary negotiation ke liye apne projects, skills, internship/experience aur market range ready rakho. Direct amount bolne se pehle role expectations aur growth scope samjho.'
  }

  if (message.includes('project')) {
    return 'Strong projects ke liye real-world features banao: auth, CRUD, search/filter, dashboard, file upload, payment/demo, deployment. README me screenshots aur live link add karo.'
  }

  return `Good question, ${name}. Is topic par best approach ye hai: apna target role clear karo, us role ke keywords identify karo, resume/projects me wahi keywords and proof add karo, aur interview ke liye examples ready rakho. Agar aap specific role/job description bhejoge to main aur targeted advice de sakta hoon.`
}

const AiChatBot = () => {
  const { backendUrl, userData } = useContext(AppContext)

  const [isOpen, setIsOpen] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! Main AI career helper hoon. Resume, ATS, job apply, interview prep ya skill suggestions ke baare me pooch sakte ho.'
    }
  ])

  const addAssistantReply = (text, provider = 'Offline helper') => {
    setMessages((prev) => [...prev, { role: 'assistant', text, provider }])
  }

  const sendMessage = async () => {
    if (!message.trim()) {
      return toast.error('Question type karo')
    }

    const userMessage = message.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setMessage('')

    if (!backendUrl) {
      addAssistantReply(getOfflineReply(userMessage, userData?.name))
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post(backendUrl + '/api/ai/chat', {
        message: userMessage,
        user: userData
      }, { timeout: 8000 })

      if (data.success) {
        addAssistantReply(data.reply, data.provider)
      } else {
        addAssistantReply(getOfflineReply(userMessage, userData?.name))
      }
    } catch (error) {
      console.error('AI chat backend unavailable, using offline reply:', error.message)
      addAssistantReply(getOfflineReply(userMessage, userData?.name))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed bottom-5 right-5 z-[9999]'>
      {isOpen && (
        <div className='w-[min(380px,calc(100vw-2rem))] bg-white border shadow-2xl rounded-2xl overflow-hidden mb-3'>
          <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
            <div>
              <p className='font-semibold'>AI Career Chatbot</p>
              <p className='text-xs text-blue-100'>ATS, resume, jobs, interview help</p>
            </div>
            <button onClick={() => setIsOpen(false)} className='text-white text-xl leading-none'>×</button>
          </div>

          <div className='h-80 overflow-y-auto p-4 space-y-3 bg-gray-50'>
            {messages.map((item, index) => (
              <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${item.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'} rounded-2xl px-4 py-2 max-w-[85%] text-sm`}>
                  <p>{item.text}</p>
                  {item.provider && <p className='text-[10px] text-gray-400 mt-1'>Powered by {item.provider}</p>}
                </div>
              </div>
            ))}
            {loading && <p className='text-sm text-gray-500'>AI typing...</p>}
          </div>

          <div className='p-3 border-t flex gap-2'>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
              className='flex-1 border rounded-lg px-3 py-2 text-sm outline-blue-500'
              placeholder='Ask AI...'
            />
            <button onClick={sendMessage} disabled={loading} className='bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm'>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='bg-blue-600 text-white shadow-xl rounded-full px-5 py-3 font-semibold border-2 border-white'
      >
        {isOpen ? 'Close AI Chat' : 'Open AI Chatbot'}
      </button>
    </div>
  )
}

export default AiChatBot