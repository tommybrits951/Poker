import { createContext, useState } from "react";
import axios from "../utils/axios"


export const CardContext = createContext()

export default function CardProvider({children}){
        
        const [auth, setAuth] = useState(null)
        const [user, setUser] = useState(null)


    return(
        <CardContext.Provider value={{auth, setAuth, user, setUser}}>
            {children}
        </CardContext.Provider>
    )
}