import axios from 'axios'

const axiosConfig = axios.create({
    baseURL: "http://localhost:9000",
    withCredentials: true
})


export default axiosConfig