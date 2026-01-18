require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const mongoose = require("mongoose")
const http = require("http")
const { Server } = require("socket.io")
const { setupGameSocket } = require("./socket/gameSocket")

const PORT = process.env.PORT || 9000;
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use("/user", require("./routes/userRoutes"))
app.use("/table", require("./routes/tableRoutes"))

mongoose.connect(process.env.URI)

mongoose.connection.once("open", () => {
    console.log("connected to mongo")
    setupGameSocket(io)
    server.listen(PORT, () => {
        console.log(`server running on port ${PORT}`)
    })
})