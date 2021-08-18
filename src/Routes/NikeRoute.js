const express = require('express')
router = express.Router()
nike = require('../Controllers/NikeController')

router.get('/', nike.nike)

module.exports = router