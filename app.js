const express = require('express')
const app = express()
const dotenv = require('dotenv').config();
const supreme = require("./shop/supreme");
const nike = require("./shop/nike");
 
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Supreme Api Call
app.get('/api/store/supreme', (req, res) => {
    res.send(req.query)
    supreme.checkout(req.query)
})

// Nike Api Call
app.get('/api/store/nike', (req, res) => {
    res.send(req.query)
    nike.checkout(req.query)
})

// PORT
const PORT = process.env.PORT || 3000; // Declare env port
app.listen(PORT, () => console.log(`Listening to port ${PORT}`)) // listen to PORT