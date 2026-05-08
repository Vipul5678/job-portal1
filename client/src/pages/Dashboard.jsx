 import { useContext, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Dashboard = () => {

    const navigate = useNavigate()

    const {
        companyData,
        companyToken,
        setCompanyData,
        setCompanyToken
    } = useContext(AppContext)

    // Logout
    const logout = () => {

        localStorage.removeItem('companyToken')

        setCompanyToken(null)
        setCompanyData(null)

        navigate('/')
    }

    // Check login
    useEffect(() => {

        if (!companyToken) {
            navigate('/')
        }

    }, [companyToken])

    return (
        <div className='min-h-screen bg-gray-100'>

            {/* Navbar */}
            <div className='bg-white shadow py-4 px-5 flex justify-between items-center'>

                <img
                    src={assets.logo}
                    alt=""
                    className='w-32 cursor-pointer'
                    onClick={() => navigate('/')}
                />

                <div className='flex items-center gap-4'>

                    <p>
                        Welcome {companyData?.name || 'Recruiter'}
                    </p>

                    <button
                        onClick={logout}
                        className='bg-red-500 text-white px-4 py-2 rounded'
                    >
                        Logout
                    </button>

                </div>

            </div>

            <div className='flex'>

                {/* Sidebar */}
                <div className='w-60 bg-white min-h-screen border-r'>

                    <NavLink
                        to='/dashboard/add-job'
                        className='block px-6 py-4 hover:bg-gray-100'
                    >
                        Add Job
                    </NavLink>

                    <NavLink
                        to='/dashboard/manage-jobs'
                        className='block px-6 py-4 hover:bg-gray-100'
                    >
                        Manage Jobs
                    </NavLink>

                    <NavLink
                        to='/dashboard/view-applications'
                        className='block px-6 py-4 hover:bg-gray-100'
                    >
                        View Applications
                    </NavLink>

                </div>

                {/* Main */}
                <div className='flex-1 p-5'>
                    <Outlet />
                </div>

            </div>

        </div>
    )
}

export default Dashboard