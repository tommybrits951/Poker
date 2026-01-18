import { useState } from 'react'
import { useGame } from '../../context/GameContext'

export default function ActionButtons({ currentBet, myBet, myChips, bigBlind }) {
    const { fold, check, call, raise, allIn } = useGame()
    const [raiseAmount, setRaiseAmount] = useState(bigBlind)
    const [showRaiseSlider, setShowRaiseSlider] = useState(false)

    const callAmount = currentBet - myBet
    const canCheck = callAmount === 0
    const minRaise = Math.max(bigBlind, currentBet - myBet + bigBlind)
    const maxRaise = myChips

    const handleRaise = () => {
        raise(raiseAmount)
        setShowRaiseSlider(false)
        setRaiseAmount(bigBlind)
    }

    const presetRaises = [
        { label: '2x', amount: currentBet * 2 || bigBlind * 2 },
        { label: '3x', amount: currentBet * 3 || bigBlind * 3 },
        { label: '1/2 Pot', amount: Math.floor(myChips / 2) },
        { label: 'Pot', amount: myChips }
    ].filter(r => r.amount <= maxRaise && r.amount >= minRaise)

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            {/* Raise Slider */}
            {showRaiseSlider && (
                <div className="bg-gray-800 p-4 rounded-xl shadow-xl mb-2">
                    <div className="flex gap-2 mb-3">
                        {presetRaises.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => setRaiseAmount(preset.amount)}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <input
                        type="range"
                        min={minRaise}
                        max={maxRaise}
                        step={bigBlind}
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        className="w-64"
                    />
                    <div className="text-white text-center mt-2">
                        Raise to: ${raiseAmount + currentBet}
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setShowRaiseSlider(false)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRaise}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={fold}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
                >
                    Fold
                </button>

                {canCheck ? (
                    <button
                        onClick={check}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                        Check
                    </button>
                ) : (
                    <button
                        onClick={call}
                        disabled={callAmount > myChips}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                        Call ${Math.min(callAmount, myChips)}
                    </button>
                )}

                <button
                    onClick={() => setShowRaiseSlider(!showRaiseSlider)}
                    disabled={myChips <= callAmount}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
                >
                    Raise
                </button>

                <button
                    onClick={allIn}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
                >
                    All In (${myChips})
                </button>
            </div>
        </div>
    )
}
