const mongoose = require("mongoose")

const PlayerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    seatNumber: { type: Number, min: 0, max: 7 },
    chips: { type: Number, default: 0 },
    cards: { type: Array, default: [] },
    currentBet: { type: Number, default: 0 },
    isFolded: { type: Boolean, default: false },
    isAllIn: { type: Boolean, default: false },
    hasActed: { type: Boolean, default: false }
}, { _id: false })

const TableSchema = new mongoose.Schema({
    name: { type: String, required: true },
    maxPlayers: { type: Number, default: 8, min: 2, max: 8 },
    smallBlind: { type: Number, default: 10 },
    bigBlind: { type: Number, default: 20 },
    minBuyIn: { type: Number, default: 400 },
    maxBuyIn: { type: Number, default: 2000 },
    players: [PlayerSchema],
    communityCards: { type: Array, default: [] },
    pot: { type: Number, default: 0 },
    currentBet: { type: Number, default: 0 },
    dealerPosition: { type: Number, default: 0 },
    currentTurn: { type: Number, default: -1 },
    gamePhase: {
        type: String,
        enum: ["waiting", "preflop", "flop", "turn", "river", "showdown"],
        default: "waiting"
    },
    isActive: { type: Boolean, default: true },
    deck: { type: Array, default: [] },
    sidePots: { type: Array, default: [] }
}, { timestamps: true })

module.exports = mongoose.model("Table", TableSchema)
