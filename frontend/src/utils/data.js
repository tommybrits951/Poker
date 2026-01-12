class Card {
    constructor(suit, rank, point, img) {
        this.suit = suit
        this.rank = rank
        this.point = point
        this.img = img
    }
}

export const deckArray = ["back.png","ace_of_clubs.png", "ace_of_diamonds.png", "ace_of_hearts.png", "ace_of_spades.png", "2_of_clubs.png", "2_of_diamonds.png", "2_of_hearts.png", "2_of_spades.png", "3_of_clubs.png", "3_of_diamonds.png", "3_of_hearts.png", "3_of_spades.png", "4_of_clubs.png", "4_of_diamonds.png", "4_of_hearts.png", "4_of_spades.png", "5_of_clubs.png", "5_of_diamonds.png", "5_of_hearts.png", "5_of_spades.png", "6_of_clubs.png", "6_of_diamonds.png", "6_of_hearts.png", "6_of_spades.png", "7_of_clubs.png", "7_of_diamonds.png", "7_of_hearts.png", "7_of_spades.png", "8_of_clubs.png", "8_of_diamonds.png", "8_of_hearts.png", "8_of_spades.png", "9_of_clubs.png", "9_of_diamonds.png", "9_of_hearts.png", "9_of_spades.png", "10_of_clubs.png", "10_of_diamonds.png", "10_of_hearts.png", "10_of_spades.png", "jack_of_clubs.png", "jack_of_diamonds.png", "jack_of_hearts.png", "jack_of_spades.png", "queen_of_clubs.png", "queen_of_diamonds.png", "queen_of_hearts.png", "queen_of_spades.png","king_of_clubs.png", "king_of_diamonds.png", "king_of_hearts.png", "king_of_spades.png"]
const backCard = new Card("back", "back", 0, deckArray[0])
let deck = [backCard]
for (let i = 1; i < deckArray.length; i++) {
    const card = new Card(`${i % 4 === 1 ? "clubs" : i % 4 === 2 ? "diamonds" : i % 4 === 3 ? "hearts" : "spades"}`, `${i % 13 === 1 ? "A" : i % 13 === 11 ? "J" : i % 13 === 12 ? "Q" : i % 13 === 0 ? "K" : i % 13}`, `${i % 13 === 1 ? 11 : i % 13 >= 10 ? 10 : i % 13}`, deckArray[i])
    deck.push(card)
}

const hands = {
    pair: 1,
    twoPair: 2,
    threeKind: 3,
    straight: 4,
    flush: 5,
    fullHouse: 6,
    fourKind: 7,
    straightFlush: 8,
    royalFlush: 9
}

function checkFlush(hand) {
    const suits = hand.map(card => card.suit)
    return suits.every(suit => suit === suits[0])
}

function checkPair(hand) {
    const ranks = hand.map(card => card.rank)
    const rankCount = {}    
}

