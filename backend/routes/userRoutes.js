const router = require("express").Router()
const controller = require('../controllers/userController')
const { capNames} = require("../middleware/checkFields")

router.post("/register", capNames, controller.register)
router.post("/login", controller.login)
router.get("/refresh", controller.refresh)
router.get("/decode", controller.decodeUser)
module.exports = router