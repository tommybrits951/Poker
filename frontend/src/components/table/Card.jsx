const SUIT_SYMBOLS = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
}

const SIZE_CLASSES = {
    sm: 'w-8 h-12 text-xs',
    md: 'w-12 h-16 text-sm',
    lg: 'w-16 h-22 text-base'
}

export default function Card({ card, size = 'md', hidden = false }) {
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md

    if (!card || hidden || card.hidden) {
        return (
            <div className={`${sizeClass} rounded-md bg-blue-900 border-2 border-blue-700 shadow-lg flex items-center justify-center`}>
                <div className="w-3/4 h-3/4 rounded border border-blue-600 bg-blue-800" />
            </div>
        )
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
    const colorClass = isRed ? 'text-red-600' : 'text-gray-900'

    return (
        <div className={`${sizeClass} rounded-md bg-white border border-gray-300 shadow-lg flex flex-col items-center justify-center p-1`}>
            <span className={`font-bold ${colorClass}`}>
                {card.rank}
            </span>
            <span className={`text-lg ${colorClass}`}>
                {SUIT_SYMBOLS[card.suit]}
            </span>
        </div>
    )
}
