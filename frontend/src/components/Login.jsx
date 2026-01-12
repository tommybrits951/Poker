import {useState} from 'react'
import axios from '../utils/axios'
import {Link} from 'react-router'
export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [err, setErr] = useState("")
  function change(e) {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value})
  }
  function submit(e) {
    e.preventDefault()
    axios.post("/user/login", formData)
    .then(res => {
        console.log(res.data)
    })
    .catch(err => console.log(err))
}
    return (
    <section className='absolute bg-stone-300 shadow-lg rounded z-10 w-1/2 left-1/4 top-1/4'>
        <h3 className='text-black bolder text-4xl m-3 text-center'>Login</h3>
        <p>{err}</p>
        <form onSubmit={submit} className=' flex flex-col m-3 p-3 justify-center items-center'>
            <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='email' name='email' value={formData.email} onChange={change} placeholder='Email' required />
            <br />
            <input className='bg-white text-black p-1 text-center rounded-lg w-2/3' type='password' name='password' value={formData.password} onChange={change} placeholder='Password' required />
            <br />
            <div className='flex'>
            <Link to={"/register"}  className='underline mx-5'>Create New Account</Link>
            <button type='submit' className='bg-cyan-600 text-white mx-5 p-2 shadow-xl rounded'>Login</button>
            </div>
        </form>
    </section>
  )
}
