import Card from './Card'

export default function PlayerSeat({ position, player, isDealer, isCurrentTurn, isMe, myCards, onClick }) {
    const hasPlayer = !!player

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ top: position.top, left: position.left }}
        >
            {/* Dealer Button */}
            {isDealer && hasPlayer && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
                    D
                </div>
            )}

            {/* Current Turn Indicator */}
            {isCurrentTurn && (
                <div className="absolute inset-0 -m-1 rounded-xl border-2 border-yellow-400 animate-pulse" />
            )}

            {/* Player Avatar / Empty Seat */}
            <div
                onClick={!hasPlayer ? onClick : undefined}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    ${hasPlayer
                        ? `${isMe ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-500'} border-2`
                        : 'bg-gray-800/50 border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700/50'
                    }
                    ${player?.isFolded ? 'opacity-50' : ''}
                    transition-all
                `}
            >
                {hasPlayer ? (
                    <span className="text-white font-bold text-lg">
                        {player.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                ) : (
                    <span className="text-gray-500 text-xs">Sit</span>
                )}
            </div>

            {/* Player Info */}
            {hasPlayer && (
                <div className="mt-1 text-center">
                    <div className={`text-sm font-medium ${isMe ? 'text-blue-300' : 'text-white'}`}>
                        {player.username}
                        {isMe && ' (You)'}
                    </div>
                    <div className="text-yellow-400 text-xs font-medium">
                        ${player.chips}
                    </div>
                    {player.currentBet > 0 && (
                        <div className="text-green-400 text-xs">
                            Bet: ${player.currentBet}
                        </div>
                    )}
                    {player.isFolded && (
                        <div className="text-red-400 text-xs">Folded</div>
                    )}
                    {player.isAllIn && (
                        <div className="text-yellow-300 text-xs font-bold">ALL IN</div>
                    )}
                </div>
            )}

            {/* Player Cards */}
            {hasPlayer && (
                <div className="flex gap-1 mt-2">
                    {isMe && myCards ? (
                        myCards.map((card, i) => (
                            <Card key={i} card={card} size="sm" />
                        ))
                    ) : (
                        player.cards?.map((card, i) => (
                            <Card key={i} card={card} size="sm" hidden={card.hidden} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
