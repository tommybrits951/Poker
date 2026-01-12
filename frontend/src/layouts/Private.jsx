import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { CardContext } from '../context/CardContext'

export default function Private() {
    const { auth } = useContext(CardContext)

    if (!auth) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
