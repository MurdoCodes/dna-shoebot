const express = require('express')
router = express.Router()
testnike = require('../Controllers/TestNikeController')

router.get('/', testnike.testnike)

module.exports = router