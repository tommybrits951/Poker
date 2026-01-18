import { useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGame } from '../context/GameContext'
import { CardContext } from '../context/CardContext'
import Table from './table/Table'

export default function GameTable() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(CardContext)
    const { joinTable, leaveTable, isConnected } = useGame()

    useEffect(() => {
        if (id && user?._id && isConnected) {
            joinTable(id, user._id)
        }

        return () => {
            leaveTable()
        }
    }, [id, user?._id, isConnected])

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl">Connecting to server...</div>
            </div>
        )
    }

    return (
        <div className="h-full">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg z-10"
            >
                Back to Lobby
            </button>
            <Table />
        </div>
    )
}
