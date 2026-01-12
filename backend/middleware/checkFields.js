

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


module.exports = {

    capNames
}