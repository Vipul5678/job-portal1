 import React, { useContext, useState } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

const RecruiterLogin = () => {

    const { backendUrl, setShowRecruiterLogin, setCompanyToken } = useContext(AppContext)

    const [isLogin, setIsLogin] = useState(true)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [company, setCompany] = useState('')
    const [phone, setPhone] = useState('')

    const onSubmitHandler = async (e) => {

        e.preventDefault()

        try {

            if (isLogin) {

                // LOGIN
                const { data } = await axios.post(
                    `${backendUrl}/api/recruiter/login`,
                    {
                        email,
                        password
                    }
                )

                if (data.success) {

                    localStorage.setItem('companyToken', data.token)

                    setCompanyToken(data.token)

                    setShowRecruiterLogin(false)

                    window.location.href = '/dashboard/add-job'

                } else {
                    alert(data.message)
                }

            } else {

                // SIGNUP
                const { data } = await axios.post(
                    `${backendUrl}/api/recruiter/signup`,
                    {
                        name,
                        email,
                        password,
                        company,
                        phone
                    }
                )

                if (data.success) {

                    localStorage.setItem('companyToken', data.token)

                    setCompanyToken(data.token)

                    setShowRecruiterLogin(false)

                    window.location.href = '/dashboard/add-job'

                } else {
                    alert(data.message)
                }

            }

        } catch (error) {

            console.log(error)

            alert(
                error.response?.data?.message ||
                'Something went wrong'
            )
        }
    }

    return (
        <div className='fixed inset-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>

            <form
                onSubmit={onSubmitHandler}
                className='bg-white p-8 rounded-xl flex flex-col gap-4 w-[350px]'
            >

                <h2 className='text-2xl font-semibold text-center'>
                    {isLogin ? 'Recruiter Login' : 'Recruiter Signup'}
                </h2>

                {!isLogin && (
                    <>
                        <input
                            type='text'
                            placeholder='Full Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='border p-2 rounded'
                            required
                        />

                        <input
                            type='text'
                            placeholder='Company Name'
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className='border p-2 rounded'
                            required
                        />

                        <input
                            type='text'
                            placeholder='Phone'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className='border p-2 rounded'
                        />
                    </>
                )}

                <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='border p-2 rounded'
                    required
                />

                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='border p-2 rounded'
                    required
                />

                <button
                    type='submit'
                    className='bg-blue-600 text-white py-2 rounded'
                >
                    {isLogin ? 'Login' : 'Create Account'}
                </button>

                <p
                    className='text-sm text-center cursor-pointer'
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {
                        isLogin
                            ? 'Create new account'
                            : 'Already have account? Login'
                    }
                </p>

            </form>

        </div>
    )
}

export default RecruiterLogin