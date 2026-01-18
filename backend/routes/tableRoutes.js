const express = require("express")
const router = express.Router()
const Table = require("../models/Table")

// Get all tables
router.get("/", async (req, res) => {
    try {
        const tables = await Table.find({ isActive: true }).select("-deck -cards")
        res.json(tables.map(t => ({
            _id: t._id,
            name: t.name,
            players: t.players.length,
            maxPlayers: t.maxPlayers,
            smallBlind: t.smallBlind,
            bigBlind: t.bigBlind,
            minBuyIn: t.minBuyIn,
            maxBuyIn: t.maxBuyIn,
            gamePhase: t.gamePhase
        })))
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Get single table
router.get("/:id", async (req, res) => {
    try {
        const table = await Table.findById(req.params.id).select("-deck")
        if (!table) {
            return res.status(404).json({ error: "Table not found" })
        }
        res.json({
            _id: table._id,
            name: table.name,
            players: table.players.map(p => ({
                oderId: p.userId,
                odername: p.username,
                oderseatNumber: p.seatNumber,
                oderchips: p.chips
            })),
            maxPlayers: table.maxPlayers,
            smallBlind: table.smallBlind,
            bigBlind: table.bigBlind,
            minBuyIn: table.minBuyIn,
            maxBuyIn: table.maxBuyIn,
            pot: table.pot,
            gamePhase: table.gamePhase
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Create new table
router.post("/", async (req, res) => {
    try {
        const { name, maxPlayers, smallBlind, bigBlind, minBuyIn, maxBuyIn } = req.body

        const table = new Table({
            name: name || `Table ${Date.now()}`,
            maxPlayers: maxPlayers || 8,
            smallBlind: smallBlind || 10,
            bigBlind: bigBlind || 20,
            minBuyIn: minBuyIn || (bigBlind || 20) * 20,
            maxBuyIn: maxBuyIn || (bigBlind || 20) * 100
        })

        await table.save()
        res.status(201).json({
            message: "Table created",
            tableId: table._id,
            name: table.name
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Delete table
router.delete("/:id", async (req, res) => {
    try {
        const table = await Table.findById(req.params.id)
        if (!table) {
            return res.status(404).json({ error: "Table not found" })
        }

        if (table.players.length > 0) {
            return res.status(400).json({ error: "Cannot delete table with players" })
        }

        await Table.findByIdAndDelete(req.params.id)
        res.json({ message: "Table deleted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
