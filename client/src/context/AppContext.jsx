 import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { jobsData } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    // Backend URL
 const backendUrl = import.meta.env.VITE_BACKEND_URL
    // Clerk
    const { user } = useUser()
    const { getToken } = useAuth();

    // IMPORTANT
    
    // States
    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    });

    const [isSearched, setIsSearched] = useState(false);

    const [jobs, setJobs] = useState(jobsData);

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);

    const [companyToken, setCompanyToken] = useState(null);
    const [companyData, setCompanyData] = useState(null);

    const [userData, setUserData] = useState(null);

    const [userApplications, setUserApplications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('demoApplications')) || [];
        } catch {
            return [];
        }
    });

    // Demo Helpers
    const getDemoApplications = () => {
        try {
            return JSON.parse(localStorage.getItem('demoApplications')) || [];
        } catch {
            return [];
        }
    };

    const saveDemoApplications = (applications) => {
        localStorage.setItem('demoApplications', JSON.stringify(applications));
    };

    const getDemoResume = () => {
        return localStorage.getItem('demoResume') || '';
    };

    const saveDemoResume = (resumeName) => {
        const demoResume = `demo-resume:${resumeName}`;
        localStorage.setItem('demoResume', demoResume);

        setUserData((prev) =>
            prev ? { ...prev, resume: demoResume } : prev
        );
    };

    const getDemoUserData = () => {
        return user
            ? {
                _id: user.id,
                name:
                    user.fullName ||
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                    'Demo User',
                email: user.primaryEmailAddress?.emailAddress || '',
                image: user.imageUrl || '',
                resume: getDemoResume()
            }
            : null;
    };

    // Fetch Jobs
    const fetchJobs = async () => {

        if (!backendUrl) {
            setJobs(jobsData);
            return;
        }

        try {

            const { data } = await axios.get(
                backendUrl + '/api/jobs'
            );

            if (data.success && data.jobs?.length) {
                setJobs(data.jobs);
            } else {
                setJobs(jobsData);
            }

        } catch (error) {
            console.error(error);
            setJobs(jobsData);
        }
    };

    // Fetch User
    const fetchUserData = async () => {

        const demoUser = getDemoUserData();

        if (!backendUrl) {
            setUserData(demoUser);
            return;
        }

        try {

            const token = await getToken();

            const { data } = await axios.get(
                backendUrl + '/api/users/user',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success) {
                setUserData(data.user);
            } else {
                setUserData(demoUser);
            }

        } catch (error) {
            console.error(error);
            setUserData(demoUser);
        }
    };

    // Fetch Applications
    const fetchUserApplications = async () => {

        const demoApplications = getDemoApplications();

        if (!backendUrl) {
            setUserApplications(demoApplications);
            return;
        }

        try {

            const token = await getToken();

            const { data } = await axios.get(
                backendUrl + '/api/users/applications',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success) {
                setUserApplications(data.applications);
            } else {
                setUserApplications(demoApplications);
            }

        } catch (error) {
            console.error(error);
            setUserApplications(demoApplications);
        }
    };

    // Load Initial Data
    useEffect(() => {

        fetchJobs();

        const storedCompanyToken =
            localStorage.getItem('companyToken');

        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken);
        }

    }, []);

    // Load User Data
    useEffect(() => {

        if (user) {
            fetchUserData();
            fetchUserApplications();
        }

    }, [user]);

    // Context Value
    const value = {
        searchFilter,
        setSearchFilter,

        isSearched,
        setIsSearched,

        jobs,
        setJobs,

        showRecruiterLogin,
        setShowRecruiterLogin,

        companyToken,
        setCompanyToken,

        companyData,
        setCompanyData,

        backendUrl,

        userData,
        setUserData,

        userApplications,
        setUserApplications,

        fetchUserData,
        fetchUserApplications,

        saveDemoResume,
        saveDemoApplications
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};