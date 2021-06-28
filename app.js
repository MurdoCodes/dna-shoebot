const express = require('express')
const app = express()
const dotenv = require('dotenv').config();
const supreme = require("./shop/supreme");
// const nike = require("./shop/nike");


app.get('/', async (req, res) => {
   res.send(`Welcome to DNA Shoebot`)
})

app.use(express.json())
app.use('/api/store/', supreme)

// app.use('/api/store/nike', nike)

// async function sendResponse(res, result){
//   res.write("data: " + `${result}!\n\n`)
//   setTimeout(() => sendResponse(res), 1000)
// }

// Supreme Api Call
// app.get('/api/store/supreme', async (req, res) => {
//     res.setHeader("Content-Type", "text/event-stream")

//     await supreme.checkout(req.query)
//     let result = supreme.supremeResponse()
//     res.json(result)
//     sendResponse(res, result)
//     // if(result){
//     //   sendResponse(res, res.json(result))
//     //   setTimeout(() => sendResponse(res), 1000)
//     // }else{
//     //   res.end()
//     // }
// })

// Nike Api Call
// app.get('/api/store/nike', (req, res) => {
//     res.send(req.query)
//     nike.checkout(req.query)
// })

// PORT
const PORT = process.env.PORT || 3000; // Declare env port
app.listen(PORT, () => console.log(`Listening to port ${PORT}`)) // listen to PORT