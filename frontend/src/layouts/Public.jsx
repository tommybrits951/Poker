import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router'
import { CardContext } from '../context/CardContext'

export default function Public() {
    const { auth } = useContext(CardContext)

    if (auth) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
