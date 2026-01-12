

function capNames(req, res, next) {
    let {firstName, lastName} = req.body
    firstName.trim().split("")
    lastName.trim().split("")
    firstName[0] = firstName[0].toUpperCase()
    lastName[0] = lastName[0].toUpperCase()
    let first = ""
    for (let i = 0; i < firstName.length; i++) {
        first += firstName[i]
    }
    let last = ""
    for (let i = 0; i < lastName.length; i++) {
        last += lastName[i]
    }
    req.body.firstName = first
    req.body.lastName = last
    next()
}

function checkDOB(req, res, next) {
    try {
        const {dob} = req.body;
        const current = new Date()
        if ((current.getFullYear() - 13) < dob.getFullYear()) {
            return res.status(400).json({message: "Not old enough."})
        }
        next()
    } catch (err) {
        next(err)
    }
}


module.exports = {
    checkDOB,
    capNames
}