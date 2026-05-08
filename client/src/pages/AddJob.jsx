 import { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const AddJob = () => {

    const [title, setTitle] = useState('')
    const [location, setLocation] = useState('Bangalore')
    const [category, setCategory] = useState('Programming')
    const [level, setLevel] = useState('Beginner level')
    const [salary, setSalary] = useState(0)

    const editorRef = useRef(null)
    const quillRef = useRef(null)

    const { backendUrl, companyToken } = useContext(AppContext)

    // ADD JOB
    const onSubmitHandler = async (e) => {

        e.preventDefault()

        try {

            const description = quillRef.current.root.innerHTML

            const { data } = await axios.post(
                backendUrl + '/api/company/post-job',
                {
                    title,
                    description,
                    location,
                    salary,
                    category,
                    level
                },
                {
                    headers: {
                        token: companyToken,
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log(data)

            if (data.success) {

                toast.success(data.message)

                // RESET FORM
                setTitle('')
                setSalary(0)
                setLocation('Bangalore')
                setCategory('Programming')
                setLevel('Beginner level')

                quillRef.current.root.innerHTML = ''

            } else {

                toast.error(data.message)

            }

        } catch (error) {

            console.log(error)

            toast.error(
                error.response?.data?.message || error.message
            )
        }
    }

    // QUILL INIT
    useEffect(() => {

        if (!quillRef.current && editorRef.current) {

            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow'
            })
        }

    }, [])

    return (

        <form
            onSubmit={onSubmitHandler}
            className='container p-4 flex flex-col w-full items-start gap-3'
        >

            {/* TITLE */}
            <div className='w-full'>

                <p className='mb-2'>Job Title</p>

                <input
                    type='text'
                    placeholder='Type here'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded'
                />

            </div>

            {/* DESCRIPTION */}
            <div className='w-full max-w-lg'>

                <p className='my-2'>Job Description</p>

                <div ref={editorRef}></div>

            </div>

            {/* SELECTS */}
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

                {/* CATEGORY */}
                <div>

                    <p className='mb-2'>Job Category</p>

                    <select
                        className='w-full px-3 py-2 border-2 border-gray-300 rounded'
                        onChange={e => setCategory(e.target.value)}
                        value={category}
                    >

                        {JobCategories.map((category, index) => (

                            <option
                                key={index}
                                value={category}
                            >
                                {category}
                            </option>

                        ))}

                    </select>

                </div>

                {/* LOCATION */}
                <div>

                    <p className='mb-2'>Job Location</p>

                    <select
                        className='w-full px-3 py-2 border-2 border-gray-300 rounded'
                        onChange={e => setLocation(e.target.value)}
                        value={location}
                    >

                        {JobLocations.map((location, index) => (

                            <option
                                key={index}
                                value={location}
                            >
                                {location}
                            </option>

                        ))}

                    </select>

                </div>

                {/* LEVEL */}
                <div>

                    <p className='mb-2'>Job Level</p>

                    <select
                        className='w-full px-3 py-2 border-2 border-gray-300 rounded'
                        onChange={e => setLevel(e.target.value)}
                        value={level}
                    >

                        <option value='Beginner level'>
                            Beginner level
                        </option>

                        <option value='Intermediate level'>
                            Intermediate level
                        </option>

                        <option value='Senior level'>
                            Senior level
                        </option>

                    </select>

                </div>

            </div>

            {/* SALARY */}
            <div>

                <p className='mb-2'>Job Salary</p>

                <input
                    type='number'
                    min={0}
                    placeholder='2500'
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]'
                />

            </div>

            {/* BUTTON */}
            <button
                type='submit'
                className='w-28 py-3 mt-4 bg-black text-white rounded'
            >
                ADD
            </button>

        </form>
    )
}

export default AddJob