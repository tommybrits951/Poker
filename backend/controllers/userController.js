const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")


function buildToken(user, secret, exp) {
    const payload = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob,
        email: user.email
    }
    const options = {
        expiresIn: exp
    }
    return jwt.sign(payload, secret, exp)
}



async function register(req, res) {
    try {
        const {firstName, lastName, dob, email, password} = req.body;
        if (!firstName || !lastName || !dob || !email || !password) {
            return res.status(400).json({message: "All fields required!"})
        }
        const duplicate = await User.findOne({email}).lean()
        if (duplicate) {
            return res.status(400).json({message: "Email already in use."})
        }
        const hashed = bcrypt.hashSync(password, 10)
        const result = await User.create({firstName, lastName, dob, email, password: hashed})
        if (result) {
            const refreshToken = buildToken(result, process.env.JWT_SECRET, "1d")
            const accessToken = buildToken(result, process.env.JWT_SECRET, "1h")
            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            res.json(accessToken)
        }
    } catch (err) {
        return res.status(500).json({message: err.message || "Server error!"})
    }
}


module.exports = {
    register
}