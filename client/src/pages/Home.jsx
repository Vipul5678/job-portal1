 import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <section className='container 2xl:px-20 mx-auto px-4 mt-8'>
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm'>
          <div>
            <p className='text-sm font-semibold text-blue-700'>New AI Feature</p>
            <h2 className='text-2xl font-semibold text-gray-800 mt-1'>AI Resume ATS Checker + Career Chatbot</h2>
            <p className='text-gray-600 mt-2 max-w-3xl'>
              Resume text paste karke ATS score dekho, missing keywords find karo, aur bottom-right AI chatbot se career help lo.
            </p>
          </div>
          <Link to='/ai-tools' className='bg-blue-600 text-white px-6 py-3 rounded-lg text-center'>
            Open AI Tools
          </Link>
        </div>
      </section>
      <JobListing />
      <AppDownload />
      <Footer />
    </div>
  )
}

export default Home