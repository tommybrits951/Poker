import {useState, useContext} from 'react'
import {CardContext} from '../context/CardContext'
import axios from '../utils/axios'
import {useNavigate, Link} from 'react-router'

const initForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: ""
}

export default function Register() {
    const [formData, setFormData] = useState(initForm)
    const [err, setErr] = useState("")
    const {setAuth} = useContext(CardContext)
    const navigate = useNavigate()

    function change(e) {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value})
    }

    function submit(e) {
        e.preventDefault()
        const pkg = new FormData()
        Object.keys(formData).map(key => {
            pkg.append(key, formData[key])
        })
        axios.post("/user/register", pkg)
        .then(res => {
            console.log(res.data)
            setAuth(res.data)
            navigate('/')
        })
        .catch(err => setErr(err.response?.data?.message || "Registration failed"))
    }

    return (
        <section className='absolute bg-stone-300 shadow-lg rounded z-10 w-1/2 left-1/4 top-1/4'>
            <h3 className='text-black bolder text-4xl m-3 text-center'>Register</h3>
            <p>{err}</p>
            <form onSubmit={submit} encType='multipart/form-data' className='flex flex-col m-3 p-3 justify-center items-center'>
                <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='text' name='firstName' value={formData.firstName} onChange={change} placeholder='First Name' required />
                <br />
                <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='text' name='lastName' value={formData.lastName} onChange={change} placeholder='Last Name' required />
                <br />
                <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='email' name='email' value={formData.email} onChange={change} placeholder='Email' required />
                <br />
                <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='password' name='password' value={formData.password} onChange={change} placeholder='Password' required />
                <br />
                <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='date' name='dob' value={formData.dob} onChange={change} required />
                <br />
                <div className='flex'>
                    <Link to={"/login"} className='underline mx-5'>Already have an account?</Link>
                    <button type='submit' className='bg-cyan-600 text-white mx-5 p-2 shadow-xl rounded'>Register</button>
                </div>
            </form>
        </section>
    )
}
