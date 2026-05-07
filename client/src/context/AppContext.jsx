 import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { jobsData } from "../assets/assets";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const { user } = useUser()
    const { getToken } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    })

    const [isSearched, setIsSearched] = useState(false)

    const [jobs, setJobs] = useState(jobsData)

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('demoApplications')) || []
        } catch {
            return []
        }
    })

    const getDemoApplications = () => {
        try {
            return JSON.parse(localStorage.getItem('demoApplications')) || []
        } catch {
            return []
        }
    }

    const saveDemoApplications = (applications) => {
        localStorage.setItem('demoApplications', JSON.stringify(applications))
    }

    const getDemoResume = () => localStorage.getItem('demoResume') || ''

    const saveDemoResume = (resumeName) => {
        const demoResume = `demo-resume:${resumeName}`
        localStorage.setItem('demoResume', demoResume)
        setUserData((prev) => prev ? { ...prev, resume: demoResume } : prev)
    }

    const getDemoUserData = () => user ? {
        _id: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Demo User',
        email: user.primaryEmailAddress?.emailAddress || '',
        image: user.imageUrl || '',
        resume: getDemoResume()
    } : null

    const addDemoApplication = (job, applicant) => {
        const demoApplications = getDemoApplications()
        const alreadyApplied = demoApplications.some((application) => application.jobId?._id === job._id)

        if (alreadyApplied) {
            setUserApplications((prev) => {
                const hasApplication = prev.some((application) => application.jobId?._id === job._id)
                return hasApplication ? prev : [...prev, ...demoApplications.filter((application) => application.jobId?._id === job._id)]
            })
            return
        }

        const application = {
            _id: `demo-${job._id}`,
            companyId: job.companyId,
            jobId: job,
            userId: applicant?._id || 'demo-user',
            applicantName: applicant?.name || 'Demo User',
            applicantEmail: applicant?.email || '',
            applicantImage: applicant?.image || '',
            date: Date.now(),
            status: 'Pending',
            isDemo: true
        }

        const updatedApplications = [...demoApplications, application]
        saveDemoApplications(updatedApplications)
        setUserApplications((prev) => [...prev, application])
    }

    const loadDemoJobs = () => {
        setJobs(jobsData)
    }

    // Function to Fetch Jobs 
    const fetchJobs = async () => {
        if (!backendUrl) {
            loadDemoJobs()
            return
        }

        try {

            const { data } = await axios.get(backendUrl + '/api/jobs')

            if (data.success && data.jobs?.length) {
                setJobs(data.jobs)
            } else {
                loadDemoJobs()
            }

        } catch (error) {
            console.error('Unable to fetch jobs from backend, showing demo jobs instead:', error.message)
            loadDemoJobs()
        }
    }

    // Function to Fetch Company Data
    const fetchCompanyData = async () => {
        if (!backendUrl) {
            setCompanyData(null)
            return
        }

        try {

            const { data } = await axios.get(backendUrl + '/api/company/company', { headers: { token: companyToken } })

            if (data.success) {
                setCompanyData(data.company)
            } else {
                console.error('Unable to fetch company data:', data.message)
                setCompanyData(null)
            }

        } catch (error) {
            console.error('Unable to fetch company data:', error.message)
            setCompanyData(null)
        }
    }

    // Function to Fetch User Data
    const fetchUserData = async () => {
        const demoUser = getDemoUserData()

        if (!backendUrl) {
            setUserData(demoUser)
            return
        }

        try {

            const token = await getToken();

            const { data } = await axios.get(backendUrl + '/api/users/user',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData({ ...data.user, resume: data.user.resume || getDemoResume() })
            } else if (data.message === 'User Not Found') {
                setUserData(demoUser)
            } else {
                console.error('Unable to fetch user data, using demo user instead:', data.message)
                setUserData(demoUser)
            }

        } catch (error) {
            console.error('Unable to fetch user data, using demo user instead:', error.message)
            setUserData(demoUser)
        }
    }

    // Function to Fetch User's Applied Applications
    const fetchUserApplications = async () => {
        const demoApplications = getDemoApplications()

        if (!backendUrl) {
            setUserApplications(demoApplications)
            return
        }

        try {

            const token = await getToken()

            const { data } = await axios.get(backendUrl + '/api/users/applications',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                const backendApplications = data.applications || []
                const demoOnlyApplications = demoApplications.filter(
                    (demoApplication) => !backendApplications.some((application) => application.jobId?._id === demoApplication.jobId?._id)
                )
                setUserApplications([...backendApplications, ...demoOnlyApplications])
            } else {
                console.error('Unable to fetch applications, showing saved demo applications instead:', data.message)
                setUserApplications(demoApplications)
            }

        } catch (error) {
            console.error('Unable to fetch applications, showing saved demo applications instead:', error.message)
            setUserApplications(demoApplications)
        }
    }

    // Retrive Company Token From LocalStorage
    useEffect(() => {
        fetchJobs()

        const storedCompanyToken = localStorage.getItem('companyToken')

        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken)
        }

    }, [])

    // Fetch Company Data if Company Token is Available
    useEffect(() => {
        if (companyToken) {
            fetchCompanyData()
        }
    }, [companyToken])

    // Fetch User's Applications & Data if User is Logged In
    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserApplications()
        }
    }, [user])

    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        addDemoApplication,
        saveDemoResume,

    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}