import {useState, useContext} from 'react'
import {CardContext} from '../context/CardContext' 
import axios from '../utils/axios'
import {useNavigate} from 'react-router-dom'
const initForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: ""
}
export default function Register() {
    const [formData, setFormData] = useState(initForm)
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
        .catch(err => console.log(err))
    }

    return (
        <section>
            <h3>New User</h3>
            <form onSubmit={submit} encType='multipart/form-data'>
                <label>
                    First Name
                    <input type="text" name="firstName" value={formData.firstName} onChange={change} required />
                </label>
                <label>
                    Last Name
                    <input type="text" name="lastName" value={formData.lastName} onChange={change} required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" value={formData.email} onChange={change} required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" value={formData.password} onChange={change} required />
                </label>
                <label>
                    Date of Birth
                    <input type="date" name="dob" value={formData.dob} onChange={change} required />
                </label>
                <button type="submit">Register</button>
            </form>
        </section>
    )
}
