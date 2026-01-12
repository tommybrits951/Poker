const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    dob: {
        required: true,
        type: Date
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    joined: {
        type: Date,
        default: new Date()
    },
    wallet: {
        type: Number,
        default: 100000
    },
    lastOnline: Date
})


module.exports = mongoose.model("User", userSchema)