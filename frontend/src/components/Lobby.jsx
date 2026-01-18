import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router'
import axios from '../utils/axios'
import { CardContext } from '../context/CardContext'

export default function Lobby() {
    const { user } = useContext(CardContext)
    const navigate = useNavigate()
    const [tables, setTables] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newTable, setNewTable] = useState({
        name: '',
        maxPlayers: 8,
        smallBlind: 10,
        bigBlind: 20
    })

    useEffect(() => {
        fetchTables()
        const interval = setInterval(fetchTables, 5000)
        return () => clearInterval(interval)
    }, [])

    const fetchTables = async () => {
        try {
            const res = await axios.get('/table')
            setTables(res.data)
        } catch (err) {
            console.error('Failed to fetch tables:', err)
        } finally {
            setLoading(false)
        }
    }

    const createTable = async () => {
        try {
            const res = await axios.post('/table', {
                name: newTable.name || `${user?.firstName}'s Table`,
                maxPlayers: newTable.maxPlayers,
                smallBlind: newTable.smallBlind,
                bigBlind: newTable.bigBlind,
                minBuyIn: newTable.bigBlind * 20,
                maxBuyIn: newTable.bigBlind * 100
            })
            setShowCreateModal(false)
            setNewTable({ name: '', maxPlayers: 8, smallBlind: 10, bigBlind: 20 })
            navigate(`/table/${res.data.tableId}`)
        } catch (err) {
            console.error('Failed to create table:', err)
        }
    }

    const joinTable = (tableId) => {
        navigate(`/table/${tableId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl">Loading tables...</div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Poker Lobby</h1>
                <div className="flex items-center gap-4">
                    <div className="text-white">
                        <span className="text-gray-400">Balance: </span>
                        <span className="text-yellow-400 font-bold">${user?.wallet || 0}</span>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                    >
                        Create Table
                    </button>
                </div>
            </div>

            {tables.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg mb-4">No tables available</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
                    >
                        Create First Table
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tables.map(table => (
                        <div
                            key={table._id}
                            className="bg-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-750 transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">{table.players}/{table.maxPlayers}</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{table.name}</h3>
                                    <p className="text-gray-400 text-sm">
                                        Blinds: ${table.smallBlind}/${table.bigBlind} |
                                        Buy-in: ${table.minBuyIn} - ${table.maxBuyIn}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    table.gamePhase === 'waiting'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-green-600 text-white'
                                }`}>
                                    {table.gamePhase === 'waiting' ? 'Waiting' : 'In Progress'}
                                </span>
                                <button
                                    onClick={() => joinTable(table._id)}
                                    disabled={table.players >= table.maxPlayers}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
                                >
                                    {table.players >= table.maxPlayers ? 'Full' : 'Join'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Table Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-white text-xl font-bold mb-4">Create New Table</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Table Name</label>
                                <input
                                    type="text"
                                    placeholder={`${user?.firstName}'s Table`}
                                    value={newTable.name}
                                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm">Max Players</label>
                                <select
                                    value={newTable.maxPlayers}
                                    onChange={(e) => setNewTable({ ...newTable, maxPlayers: Number(e.target.value) })}
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mt-1"
                                >
                                    {[2, 4, 6, 8].map(n => (
                                        <option key={n} value={n}>{n} Players</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm">Small Blind</label>
                                    <select
                                        value={newTable.smallBlind}
                                        onChange={(e) => setNewTable({
                                            ...newTable,
                                            smallBlind: Number(e.target.value),
                                            bigBlind: Number(e.target.value) * 2
                                        })}
                                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mt-1"
                                    >
                                        {[5, 10, 25, 50, 100].map(n => (
                                            <option key={n} value={n}>${n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Big Blind</label>
                                    <div className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg mt-1">
                                        ${newTable.bigBlind}
                                    </div>
                                </div>
                            </div>

                            <div className="text-gray-400 text-sm">
                                Buy-in: ${newTable.bigBlind * 20} - ${newTable.bigBlind * 100}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createTable}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                            >
                                Create Table
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
