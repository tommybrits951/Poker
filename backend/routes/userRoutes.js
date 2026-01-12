const router = require("express").Router()
const controller = require('../controllers/userController')
const {checkDOB, capNames} = require("../middleware/checkFields")

router.post("/register", checkDOB, capNames, controller.register)


module.exports = router