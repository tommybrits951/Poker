require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const mongoose = require("mongoose")


const PORT = process.env.PORT || 9000;
const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use("/user", require("./routes/userRoutes"))

mongoose.connect(process.env.URI)

mongoose.connection.once("open", () => {
    console.log("connected to mongo")
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`)
    })
})