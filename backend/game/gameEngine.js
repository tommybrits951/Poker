// Card and Deck utilities
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }

function createDeck() {
    const deck = []
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                suit,
                rank,
                value: RANK_VALUES[rank],
                img: `${rank === 'A' ? 'ace' : rank === 'J' ? 'jack' : rank === 'Q' ? 'queen' : rank === 'K' ? 'king' : rank}_of_${suit}.png`
            })
        }
    }
    return deck
}

function shuffleDeck(deck) {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

function dealCards(deck, count) {
    return deck.splice(0, count)
}

// Hand evaluation
const HAND_RANKS = {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
}

function evaluateHand(cards) {
    if (cards.length < 5) return { rank: 0, name: 'Invalid', highCards: [] }

    const allCombinations = getCombinations(cards, 5)
    let bestHand = { rank: 0, name: 'High Card', highCards: [] }

    for (const combo of allCombinations) {
        const hand = evaluateFiveCardHand(combo)
        if (hand.rank > bestHand.rank ||
            (hand.rank === bestHand.rank && compareHighCards(hand.highCards, bestHand.highCards) > 0)) {
            bestHand = hand
        }
    }

    return bestHand
}

function getCombinations(arr, size) {
    const result = []
    function combine(start, combo) {
        if (combo.length === size) {
            result.push([...combo])
            return
        }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i])
            combine(i + 1, combo)
            combo.pop()
        }
    }
    combine(0, [])
    return result
}

function evaluateFiveCardHand(cards) {
    const sorted = [...cards].sort((a, b) => b.value - a.value)
    const values = sorted.map(c => c.value)
    const suits = sorted.map(c => c.suit)

    const isFlush = suits.every(s => s === suits[0])
    const isStraight = checkStraight(values)
    const counts = getCounts(values)
    const countValues = Object.values(counts).sort((a, b) => b - a)

    // Royal Flush
    if (isFlush && isStraight && values.includes(14) && values.includes(13)) {
        return { rank: HAND_RANKS.ROYAL_FLUSH, name: 'Royal Flush', highCards: values }
    }

    // Straight Flush
    if (isFlush && isStraight) {
        return { rank: HAND_RANKS.STRAIGHT_FLUSH, name: 'Straight Flush', highCards: values }
    }

    // Four of a Kind
    if (countValues[0] === 4) {
        const quad = Number(Object.keys(counts).find(k => counts[k] === 4))
        const kicker = values.filter(v => v !== quad)
        return { rank: HAND_RANKS.FOUR_OF_A_KIND, name: 'Four of a Kind', highCards: [quad, ...kicker] }
    }

    // Full House
    if (countValues[0] === 3 && countValues[1] === 2) {
        const trips = Number(Object.keys(counts).find(k => counts[k] === 3))
        const pair = Number(Object.keys(counts).find(k => counts[k] === 2))
        return { rank: HAND_RANKS.FULL_HOUSE, name: 'Full House', highCards: [trips, pair] }
    }

    // Flush
    if (isFlush) {
        return { rank: HAND_RANKS.FLUSH, name: 'Flush', highCards: values }
    }

    // Straight
    if (isStraight) {
        return { rank: HAND_RANKS.STRAIGHT, name: 'Straight', highCards: values }
    }

    // Three of a Kind
    if (countValues[0] === 3) {
        const trips = Number(Object.keys(counts).find(k => counts[k] === 3))
        const kickers = values.filter(v => v !== trips).slice(0, 2)
        return { rank: HAND_RANKS.THREE_OF_A_KIND, name: 'Three of a Kind', highCards: [trips, ...kickers] }
    }

    // Two Pair
    if (countValues[0] === 2 && countValues[1] === 2) {
        const pairs = Object.keys(counts).filter(k => counts[k] === 2).map(Number).sort((a, b) => b - a)
        const kicker = values.find(v => !pairs.includes(v))
        return { rank: HAND_RANKS.TWO_PAIR, name: 'Two Pair', highCards: [...pairs, kicker] }
    }

    // Pair
    if (countValues[0] === 2) {
        const pair = Number(Object.keys(counts).find(k => counts[k] === 2))
        const kickers = values.filter(v => v !== pair).slice(0, 3)
        return { rank: HAND_RANKS.PAIR, name: 'Pair', highCards: [pair, ...kickers] }
    }

    // High Card
    return { rank: HAND_RANKS.HIGH_CARD, name: 'High Card', highCards: values }
}

function checkStraight(values) {
    const sorted = [...new Set(values)].sort((a, b) => b - a)
    if (sorted.length < 5) return false

    // Check for A-2-3-4-5 straight (wheel)
    if (sorted.includes(14) && sorted.includes(2) && sorted.includes(3) && sorted.includes(4) && sorted.includes(5)) {
        return true
    }

    for (let i = 0; i <= sorted.length - 5; i++) {
        if (sorted[i] - sorted[i + 4] === 4) return true
    }
    return false
}

function getCounts(values) {
    return values.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1
        return acc
    }, {})
}

function compareHighCards(a, b) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) return a[i] - b[i]
    }
    return 0
}

function determineWinners(players, communityCards) {
    const activePlayers = players.filter(p => !p.isFolded)

    const playerHands = activePlayers.map(player => {
        const allCards = [...player.cards, ...communityCards]
        const evaluation = evaluateHand(allCards)
        return { player, evaluation }
    })

    playerHands.sort((a, b) => {
        if (a.evaluation.rank !== b.evaluation.rank) {
            return b.evaluation.rank - a.evaluation.rank
        }
        return compareHighCards(b.evaluation.highCards, a.evaluation.highCards)
    })

    const winners = [playerHands[0]]
    for (let i = 1; i < playerHands.length; i++) {
        const current = playerHands[i]
        const best = playerHands[0]
        if (current.evaluation.rank === best.evaluation.rank &&
            compareHighCards(current.evaluation.highCards, best.evaluation.highCards) === 0) {
            winners.push(current)
        } else {
            break
        }
    }

    return winners.map(w => ({
        oderId: w.player.userId,
        odername: w.player.username,
        oderhand: w.evaluation.name,
        oderhighCards: w.evaluation.highCards
    }))
}

function getNextActivePlayer(players, currentPosition, excludeFolded = true) {
    const activePlayers = players.filter(p => !p.isFolded || !excludeFolded)
    if (activePlayers.length === 0) return -1

    let nextPos = (currentPosition + 1) % players.length
    let attempts = 0

    while (attempts < players.length) {
        const player = players[nextPos]
        if (player && !player.isFolded && !player.isAllIn) {
            return nextPos
        }
        nextPos = (nextPos + 1) % players.length
        attempts++
    }

    return -1
}

function calculateSidePots(players) {
    const activePlayers = players.filter(p => !p.isFolded).sort((a, b) => a.currentBet - b.currentBet)
    const sidePots = []
    let processedBet = 0

    for (let i = 0; i < activePlayers.length; i++) {
        const player = activePlayers[i]
        if (player.currentBet > processedBet) {
            const betLevel = player.currentBet - processedBet
            const eligiblePlayers = activePlayers.slice(i)
            const potAmount = betLevel * eligiblePlayers.length

            sidePots.push({
                amount: potAmount,
                eligiblePlayers: eligiblePlayers.map(p => p.userId)
            })
            processedBet = player.currentBet
        }
    }

    return sidePots
}

module.exports = {
    createDeck,
    shuffleDeck,
    dealCards,
    evaluateHand,
    determineWinners,
    getNextActivePlayer,
    calculateSidePots,
    HAND_RANKS
}
