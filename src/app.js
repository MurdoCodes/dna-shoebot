require('dotenv').config()
const express = require('express')
const app = express()

app.get('/', async (req, res) => { res.send(`Welcome to DNA Shoebot`) })

app.use(express.json())

app.use('/api/store/supreme/', require("./Routes/SupremeRoute")) // supreme route

app.use('/api/store/nike/', require("./Routes/NikeRoute")) // nike route

app.use('/api/store/test/', require("./Routes/TestNikeRoute")) // Test nike route

const PORT = process.env.PORT || 5000 // Declare env port
app.listen(PORT, () => console.log(`Listening to port ${PORT}`)) // listen to PORT