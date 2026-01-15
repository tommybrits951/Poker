import { createContext, useEffect, useState } from "react";
import axios from "../utils/axios"


const CardContext = createContext()

export default function CardProvider({children}){
        
        const [auth, setAuth] = useState(null)
        const [user, setUser] = useState(null)

    useEffect(() => {
        !auth && axios.get("/user/refresh")
        .then(res => {
            setAuth(res.data)
        })
        .catch(err => console.log(err))
        axios.get("/user/decode", {
            headers: {
                Authorization: `Bearer ${auth}`
            }
        })
        .then(res => setUser(res.data))
        .catch(err => console.log(err))
    }, [setAuth, setUser, auth])
    return(
        <CardContext.Provider value={{auth, setAuth, user, setUser}}>
            {children}
        </CardContext.Provider>
    )
}
export {CardContext}