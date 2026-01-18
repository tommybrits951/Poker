import { useState, useContext } from 'react'
import { useGame } from '../../context/GameContext'
import { CardContext } from '../../context/CardContext'
import Card from './Card'
import PlayerSeat from './PlayerSeat'
import ActionButtons from './ActionButtons'

const SEAT_POSITIONS = [
    { id: 0, top: '82%', left: '50%' },
    { id: 1, top: '70%', left: '18%' },
    { id: 2, top: '38%', left: '8%' },
    { id: 3, top: '8%', left: '22%' },
    { id: 4, top: '8%', left: '50%' },
    { id: 5, top: '8%', left: '78%' },
    { id: 6, top: '38%', left: '92%' },
    { id: 7, top: '70%', left: '82%' }
]

export default function Table() {
    const { user } = useContext(CardContext)
    const { gameState, sitDown, leaveTable, error } = useGame()
    const [buyInAmount, setBuyInAmount] = useState(1000)
    const [showBuyIn, setShowBuyIn] = useState(false)
    const [selectedSeat, setSelectedSeat] = useState(null)

    if (!gameState) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl">Loading table...</div>
            </div>
        )
    }

    const myPlayer = gameState.players?.find(p => p.userId === user?._id)
    const isMyTurn = gameState.currentTurn !== -1 &&
        gameState.players?.[gameState.currentTurn]?.userId === user?._id

    const handleSeatClick = (seatId) => {
        const seatTaken = gameState.players?.some(p => p.seatNumber === seatId)
        if (!seatTaken && !myPlayer) {
            setSelectedSeat(seatId)
            setShowBuyIn(true)
        }
    }

    const handleBuyIn = () => {
        if (selectedSeat !== null && buyInAmount >= gameState.minBuyIn) {
            sitDown(selectedSeat, buyInAmount, user._id)
            setShowBuyIn(false)
            setSelectedSeat(null)
        }
    }

    const getPlayerAtSeat = (seatId) => {
        return gameState.players?.find(p => p.seatNumber === seatId)
    }

    return (
        <div className="relative w-full h-full min-h-[600px] flex items-center justify-center p-4">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50">
                    {error}
                </div>
            )}

            {/* Poker Table */}
            <div className="relative w-full max-w-5xl aspect-[2/1]">
                {/* Table outer border */}
                <div className="absolute inset-0 bg-amber-900 rounded-[50%] shadow-2xl">
                    {/* Table felt */}
                    <div className="absolute inset-3 bg-green-800 rounded-[50%] border-4 border-green-700">
                        {/* Inner felt pattern */}
                        <div className="absolute inset-4 bg-green-700 rounded-[50%] border-2 border-green-600/50">

                            {/* Center content */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                                {/* Pot */}
                                <div className="bg-black/40 px-6 py-2 rounded-full">
                                    <span className="text-yellow-400 font-bold text-lg">
                                        Pot: ${gameState.pot || 0}
                                    </span>
                                </div>

                                {/* Community Cards */}
                                <div className="flex gap-2">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <Card
                                            key={i}
                                            card={gameState.communityCards?.[i]}
                                            size="md"
                                        />
                                    ))}
                                </div>

                                {/* Game Phase */}
                                <div className="text-white/70 text-sm capitalize">
                                    {gameState.gamePhase === "waiting" ? "Waiting for players..." : gameState.gamePhase}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Player Seats */}
                {SEAT_POSITIONS.map(seat => {
                    const player = getPlayerAtSeat(seat.id)
                    const isDealer = gameState.dealerPosition === seat.id
                    const isCurrentTurn = gameState.players?.[gameState.currentTurn]?.seatNumber === seat.id

                    return (
                        <PlayerSeat
                            key={seat.id}
                            position={seat}
                            player={player}
                            isDealer={isDealer}
                            isCurrentTurn={isCurrentTurn}
                            isMe={player?.userId === user?._id}
                            myCards={player?.userId === user?._id ? gameState.myCards : null}
                            onClick={() => handleSeatClick(seat.id)}
                        />
                    )
                })}
            </div>

            {/* Action Buttons */}
            {myPlayer && isMyTurn && gameState.gamePhase !== "waiting" && gameState.gamePhase !== "showdown" && (
                <ActionButtons
                    currentBet={gameState.currentBet}
                    myBet={myPlayer.currentBet}
                    myChips={myPlayer.chips}
                    bigBlind={gameState.bigBlind || 20}
                />
            )}

            {/* Leave Table Button */}
            {myPlayer && (
                <button
                    onClick={leaveTable}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                    Leave Table
                </button>
            )}

            {/* Buy-in Modal */}
            {showBuyIn && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                        <h3 className="text-white text-xl font-bold mb-4">Buy In</h3>
                        <p className="text-gray-400 mb-2">
                            Min: ${gameState.minBuyIn || 400} - Max: ${gameState.maxBuyIn || 2000}
                        </p>
                        <input
                            type="range"
                            min={gameState.minBuyIn || 400}
                            max={gameState.maxBuyIn || 2000}
                            step={100}
                            value={buyInAmount}
                            onChange={(e) => setBuyInAmount(Number(e.target.value))}
                            className="w-full mb-2"
                        />
                        <p className="text-white text-center text-2xl mb-4">${buyInAmount}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBuyIn(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBuyIn}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                            >
                                Sit Down
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
