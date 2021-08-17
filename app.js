const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const supreme = require("./shop/supreme")
const nike = require("./shop/nike")
const test = require("./shop/test")

app.get('/', async (req, res) => {
   res.send(`Welcome to DNA Shoebot`)
})

app.use(express.json())

app.use('/api/store/supreme/', supreme) // supreme route

app.use('/api/store/nike/', nike) // nike route

app.use('/api/store/test/', test) // nike route

// PORT
const PORT = process.env.PORT || 5000; // Declare env port
app.listen(PORT, () => console.log(`Listening to port ${PORT}`)) // listen to PORT