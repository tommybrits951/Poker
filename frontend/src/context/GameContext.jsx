import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getSocket, connectSocket, disconnectSocket } from "../utils/socket"

const GameContext = createContext()

export function useGame() {
    return useContext(GameContext)
}

export default function GameProvider({ children }) {
    const [socket, setSocket] = useState(null)
    const [gameState, setGameState] = useState(null)
    const [tableId, setTableId] = useState(null)
    const [error, setError] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const s = connectSocket()
        setSocket(s)

        s.on("connect", () => {
            setIsConnected(true)
            console.log("Connected to game server")
        })

        s.on("disconnect", () => {
            setIsConnected(false)
            console.log("Disconnected from game server")
        })

        s.on("error", (data) => {
            setError(data.message)
            setTimeout(() => setError(null), 3000)
        })

        s.on("gameState", (state) => {
            setGameState(state)
        })

        s.on("playerJoined", (data) => {
            console.log("Player joined:", data.username)
        })

        s.on("playerSatDown", (data) => {
            setGameState(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    players: [...prev.players, {
                        userId: data.userId,
                        username: data.username,
                        seatNumber: data.seatNumber,
                        chips: data.chips,
                        currentBet: 0,
                        isFolded: false,
                        isAllIn: false,
                        cards: []
                    }]
                }
            })
        })

        s.on("playerLeft", (data) => {
            setGameState(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    players: prev.players.filter(p => p.userId !== data.userId)
                }
            })
        })

        s.on("handStarted", (data) => {
            setGameState(prev => ({
                ...prev,
                dealerPosition: data.dealerPosition,
                pot: data.pot,
                currentTurn: data.currentTurn,
                gamePhase: "preflop"
            }))
        })

        s.on("actionTaken", (data) => {
            setGameState(prev => {
                if (!prev) return prev
                const updatedPlayers = prev.players.map(p =>
                    p.userId === data.userId
                        ? { ...p, chips: data.chips, currentBet: prev.currentBet }
                        : p
                )
                return {
                    ...prev,
                    players: updatedPlayers,
                    pot: data.pot,
                    currentBet: data.currentBet
                }
            })
        })

        s.on("turnChanged", (data) => {
            setGameState(prev => ({
                ...prev,
                currentTurn: data.currentTurn
            }))
        })

        s.on("phaseChanged", (data) => {
            setGameState(prev => ({
                ...prev,
                gamePhase: data.phase,
                communityCards: data.communityCards,
                currentTurn: data.currentTurn,
                pot: data.pot
            }))
        })

        s.on("handEnded", (data) => {
            setGameState(prev => ({
                ...prev,
                gamePhase: "showdown",
                winners: data.winners,
                revealedPlayers: data.revealedPlayers
            }))
        })

        s.on("waitingForPlayers", () => {
            setGameState(prev => ({
                ...prev,
                gamePhase: "waiting"
            }))
        })

        return () => {
            disconnectSocket()
        }
    }, [])

    const joinTable = useCallback((tId, userId) => {
        if (socket) {
            setTableId(tId)
            socket.emit("joinTable", { tableId: tId, userId })
        }
    }, [socket])

    const sitDown = useCallback((seatNumber, buyIn, userId) => {
        if (socket && tableId) {
            socket.emit("sitDown", { tableId, userId, seatNumber, buyIn })
        }
    }, [socket, tableId])

    const leaveTable = useCallback(() => {
        if (socket && tableId) {
            socket.emit("leaveTable", { tableId })
            setTableId(null)
            setGameState(null)
        }
    }, [socket, tableId])

    const performAction = useCallback((action, amount = 0) => {
        if (socket && tableId) {
            socket.emit("playerAction", { tableId, action, amount })
        }
    }, [socket, tableId])

    const fold = useCallback(() => performAction("fold"), [performAction])
    const check = useCallback(() => performAction("check"), [performAction])
    const call = useCallback(() => performAction("call"), [performAction])
    const raise = useCallback((amount) => performAction("raise", amount), [performAction])
    const allIn = useCallback(() => performAction("allIn"), [performAction])

    const value = {
        socket,
        gameState,
        tableId,
        error,
        isConnected,
        joinTable,
        sitDown,
        leaveTable,
        fold,
        check,
        call,
        raise,
        allIn
    }

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    )
}
