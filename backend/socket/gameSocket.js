const Table = require("../models/Table")
const User = require("../models/User")
const { createDeck, shuffleDeck, dealCards, determineWinners, getNextActivePlayer } = require("../game/gameEngine")

function setupGameSocket(io) {
    io.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`)

        socket.on("joinTable", async ({ tableId, userId }) => {
            try {
                const table = await Table.findById(tableId)
                const user = await User.findById(userId)
                if (!table || !user) {
                    socket.emit("error", { message: "Table or user not found" })
                    return
                }

                socket.join(tableId)
                socket.tableId = tableId
                socket.userId = userId

                const gameState = getGameStateForPlayer(table, userId)
                socket.emit("gameState", gameState)
                io.to(tableId).emit("playerJoined", {
                    username: user.firstName,
                    playerCount: table.players.length
                })
            } catch (err) {
                socket.emit("error", { message: err.message })
            }
        })

        socket.on("sitDown", async ({ tableId, userId, seatNumber, buyIn }) => {
            try {
                const table = await Table.findById(tableId)
                const user = await User.findById(userId)

                if (!table || !user) {
                    socket.emit("error", { message: "Table or user not found" })
                    return
                }

                if (buyIn > user.wallet || buyIn < table.minBuyIn || buyIn > table.maxBuyIn) {
                    socket.emit("error", { message: "Invalid buy-in amount" })
                    return
                }

                const seatTaken = table.players.some(p => p.seatNumber === seatNumber)
                if (seatTaken) {
                    socket.emit("error", { message: "Seat is taken" })
                    return
                }

                const alreadySeated = table.players.some(p => p.userId.toString() === userId)
                if (alreadySeated) {
                    socket.emit("error", { message: "Already seated at this table" })
                    return
                }

                table.players.push({
                    userId: user._id,
                    username: user.firstName,
                    seatNumber: seatNumber,
                    chips: buyIn,
                    cards: [],
                    currentBet: 0,
                    isFolded: false,
                    isAllIn: false
                })

                user.wallet -= buyIn
                await user.save()
                await table.save()

                io.to(tableId).emit("playerSatDown", {
                    userId: user._id,
                    username: user.firstName,
                    seatNumber: seatNumber,
                    chips: buyIn
                })

                if (table.players.length >= 2 && table.gamePhase === "waiting") {
                    startNewHand(io, tableId)
                }
            } catch (err) {
                socket.emit("error", { message: err.message })
            }
        })

        socket.on("playerAction", async ({ tableId, action, amount }) => {
            try {
                const table = await Table.findById(tableId)
                if (!table) return

                const playerIndex = table.players.findIndex(p => p.userId.toString() === socket.userId)
                if (playerIndex === -1 || playerIndex !== table.currentTurn) {
                    socket.emit("error", { message: "Not your turn" })
                    return
                }

                const player = table.players[playerIndex]

                switch (action) {
                    case "fold":
                        player.isFolded = true
                        break

                    case "check":
                        if (table.currentBet > player.currentBet) {
                            socket.emit("error", { message: "Cannot check, must call or raise" })
                            return
                        }
                        break

                    case "call":
                        const callAmount = Math.min(table.currentBet - player.currentBet, player.chips)
                        player.chips -= callAmount
                        player.currentBet += callAmount
                        table.pot += callAmount
                        if (player.chips === 0) player.isAllIn = true
                        break

                    case "raise":
                        if (amount < table.bigBlind || amount > player.chips) {
                            socket.emit("error", { message: "Invalid raise amount" })
                            return
                        }
                        const raiseTotal = table.currentBet - player.currentBet + amount
                        player.chips -= raiseTotal
                        player.currentBet += raiseTotal
                        table.pot += raiseTotal
                        table.currentBet = player.currentBet
                        if (player.chips === 0) player.isAllIn = true
                        table.players.forEach(p => { if (!p.isFolded && !p.isAllIn) p.hasActed = false })
                        player.hasActed = true
                        break

                    case "allIn":
                        const allInAmount = player.chips
                        player.currentBet += allInAmount
                        table.pot += allInAmount
                        player.chips = 0
                        player.isAllIn = true
                        if (player.currentBet > table.currentBet) {
                            table.currentBet = player.currentBet
                            table.players.forEach(p => { if (!p.isFolded && !p.isAllIn) p.hasActed = false })
                        }
                        break
                }

                player.hasActed = true
                await table.save()

                io.to(tableId).emit("actionTaken", {
                    oderId: socket.userId,
                    action,
                    amount: amount || 0,
                    chips: player.chips,
                    pot: table.pot,
                    currentBet: table.currentBet
                })

                const activePlayers = table.players.filter(p => !p.isFolded)

                if (activePlayers.length === 1) {
                    await endHand(io, tableId, [activePlayers[0]])
                    return
                }

                const allActed = table.players.every(p => p.isFolded || p.isAllIn || p.hasActed)
                const betsEqual = table.players.filter(p => !p.isFolded && !p.isAllIn)
                    .every(p => p.currentBet === table.currentBet)

                if (allActed && betsEqual) {
                    await advancePhase(io, tableId)
                } else {
                    table.currentTurn = getNextActivePlayer(table.players, table.currentTurn)
                    await table.save()
                    io.to(tableId).emit("turnChanged", { currentTurn: table.currentTurn })
                }
            } catch (err) {
                socket.emit("error", { message: err.message })
            }
        })

        socket.on("leaveTable", async ({ tableId }) => {
            try {
                const table = await Table.findById(tableId)
                if (!table) return

                const playerIndex = table.players.findIndex(p => p.userId.toString() === socket.userId)
                if (playerIndex !== -1) {
                    const player = table.players[playerIndex]

                    const user = await User.findById(socket.userId)
                    if (user) {
                        user.wallet += player.chips
                        await user.save()
                    }

                    table.players.splice(playerIndex, 1)
                    await table.save()

                    io.to(tableId).emit("playerLeft", { oderId: socket.userId })
                }

                socket.leave(tableId)
            } catch (err) {
                socket.emit("error", { message: err.message })
            }
        })

        socket.on("disconnect", async () => {
            console.log(`Player disconnected: ${socket.id}`)
            if (socket.tableId) {
                socket.to(socket.tableId).emit("playerDisconnected", { oderId: socket.userId })
            }
        })

        socket.on("getTableState", async ({ tableId }) => {
            try {
                const table = await Table.findById(tableId)
                if (!table) return

                const gameState = getGameStateForPlayer(table, socket.userId)
                socket.emit("gameState", gameState)
            } catch (err) {
                socket.emit("error", { message: err.message })
            }
        })
    })
}

async function startNewHand(io, tableId) {
    const table = await Table.findById(tableId)
    if (!table || table.players.length < 2) return

    table.deck = shuffleDeck(createDeck())
    table.communityCards = []
    table.pot = 0
    table.currentBet = 0
    table.sidePots = []
    table.gamePhase = "preflop"

    table.players.forEach(p => {
        p.cards = []
        p.currentBet = 0
        p.isFolded = false
        p.isAllIn = false
        p.hasActed = false
    })

    table.dealerPosition = (table.dealerPosition + 1) % table.players.length

    const sbIndex = (table.dealerPosition + 1) % table.players.length
    const bbIndex = (table.dealerPosition + 2) % table.players.length

    const sbPlayer = table.players[sbIndex]
    const bbPlayer = table.players[bbIndex]

    const sbAmount = Math.min(table.smallBlind, sbPlayer.chips)
    const bbAmount = Math.min(table.bigBlind, bbPlayer.chips)

    sbPlayer.chips -= sbAmount
    sbPlayer.currentBet = sbAmount
    if (sbPlayer.chips === 0) sbPlayer.isAllIn = true

    bbPlayer.chips -= bbAmount
    bbPlayer.currentBet = bbAmount
    if (bbPlayer.chips === 0) bbPlayer.isAllIn = true

    table.pot = sbAmount + bbAmount
    table.currentBet = bbAmount

    table.players.forEach(player => {
        player.cards = dealCards(table.deck, 2)
    })

    table.currentTurn = (bbIndex + 1) % table.players.length
    while (table.players[table.currentTurn].isAllIn) {
        table.currentTurn = (table.currentTurn + 1) % table.players.length
    }

    await table.save()

    table.players.forEach(player => {
        const socketId = getSocketIdForUser(io, player.userId.toString())
        if (socketId) {
            const gameState = getGameStateForPlayer(table, player.userId.toString())
            io.to(socketId).emit("gameState", gameState)
        }
    })

    io.to(tableId).emit("handStarted", {
        dealerPosition: table.dealerPosition,
        pot: table.pot,
        currentTurn: table.currentTurn,
        blinds: { sb: sbIndex, bb: bbIndex }
    })
}

async function advancePhase(io, tableId) {
    const table = await Table.findById(tableId)
    if (!table) return

    table.players.forEach(p => {
        p.currentBet = 0
        p.hasActed = false
    })
    table.currentBet = 0

    const phases = ["preflop", "flop", "turn", "river", "showdown"]
    const currentPhaseIndex = phases.indexOf(table.gamePhase)
    table.gamePhase = phases[currentPhaseIndex + 1]

    switch (table.gamePhase) {
        case "flop":
            table.communityCards = dealCards(table.deck, 3)
            break
        case "turn":
        case "river":
            table.communityCards.push(...dealCards(table.deck, 1))
            break
        case "showdown":
            const winners = determineWinners(table.players, table.communityCards)
            await endHand(io, tableId, winners)
            return
    }

    table.currentTurn = getNextActivePlayer(table.players, table.dealerPosition)
    await table.save()

    io.to(tableId).emit("phaseChanged", {
        phase: table.gamePhase,
        communityCards: table.communityCards,
        currentTurn: table.currentTurn,
        pot: table.pot
    })
}

async function endHand(io, tableId, winners) {
    const table = await Table.findById(tableId)
    if (!table) return

    const winAmount = Math.floor(table.pot / winners.length)

    for (const winner of winners) {
        const player = table.players.find(p =>
            p.userId.toString() === winner.userId?.toString()
        )
        if (player) {
            player.chips += winAmount
        }
    }

    table.gamePhase = "showdown"
    await table.save()

    const revealedPlayers = table.players.filter(p => !p.isFolded).map(p => ({
        oderId: p.userId,
        username: p.username,
        cards: p.cards
    }))

    io.to(tableId).emit("handEnded", {
        winners: winners.map(w => ({
            oderId: w.userId,
            username: w.username,
            hand: w.hand,
            amount: winAmount
        })),
        revealedPlayers,
        pot: table.pot
    })

    const brokePlayers = table.players.filter(p => p.chips === 0)
    for (const broke of brokePlayers) {
        io.to(tableId).emit("playerBusted", { oderId: broke.userId })
    }
    table.players = table.players.filter(p => p.chips > 0)
    await table.save()

    setTimeout(async () => {
        const freshTable = await Table.findById(tableId)
        if (freshTable && freshTable.players.length >= 2) {
            startNewHand(io, tableId)
        } else if (freshTable) {
            freshTable.gamePhase = "waiting"
            await freshTable.save()
            io.to(tableId).emit("waitingForPlayers")
        }
    }, 5000)
}

function getGameStateForPlayer(table, userId) {
    return {
        tableId: table._id,
        name: table.name,
        pot: table.pot,
        currentBet: table.currentBet,
        communityCards: table.communityCards,
        gamePhase: table.gamePhase,
        dealerPosition: table.dealerPosition,
        currentTurn: table.currentTurn,
        minBuyIn: table.minBuyIn,
        maxBuyIn: table.maxBuyIn,
        bigBlind: table.bigBlind,
        players: table.players.map(p => ({
            userId: p.userId,
            username: p.username,
            seatNumber: p.seatNumber,
            chips: p.chips,
            currentBet: p.currentBet,
            isFolded: p.isFolded,
            isAllIn: p.isAllIn,
            cards: p.userId.toString() === userId ? p.cards : p.cards.map(() => ({ hidden: true }))
        })),
        myCards: table.players.find(p => p.userId.toString() === userId)?.cards || []
    }
}

function getSocketIdForUser(io, userId) {
    for (const [socketId, socket] of io.sockets.sockets) {
        if (socket.userId === userId) return socketId
    }
    return null
}

module.exports = { setupGameSocket }
