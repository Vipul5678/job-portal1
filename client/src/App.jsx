 import { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Applications from './pages/Applications'
import ApplyJob from './pages/ApplyJob'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'

const App = () => {

  const { showRecruiterLogin, companyToken } =
    useContext(AppContext)

  return (
    <div>

      {showRecruiterLogin && <RecruiterLogin />}

      <Routes>

        <Route path='/' element={<Home />} />

        <Route
          path='/applications'
          element={<Applications />}
        />

        <Route
          path='/apply-job/:id'
          element={<ApplyJob />}
        />

        <Route path='/dashboard' element={<Dashboard />}>

          {companyToken && (
            <>
              <Route
                path='add-job'
                element={<AddJob />}
              />

              <Route
                path='manage-jobs'
                element={<ManageJobs />}
              />

              <Route
                path='view-applications'
                element={<ViewApplications />}
              />
            </>
          )}

        </Route>

      </Routes>

    </div>
  )
}

export default App