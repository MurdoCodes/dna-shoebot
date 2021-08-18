const express = require('express')
router = express.Router()
supreme = require('../Controllers/SupremeController')

router.get('/', supreme.supreme)

module.exports = router