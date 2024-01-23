import express, { text } from 'express'
import cors from 'cors'
import config from './config.cjs'
import cookieParser from 'cookie-parser'
import { resolve } from 'path'
import { Html } from '../client/html.js'
import { startBot } from './bot/bot.js'

const server = express()
const PORT = process.env.PORT || 8080
const __dirname = process.cwd()



const middlewere = [
  cors(),
  cookieParser(),
  express.json({ limit: '50kb' }),
  express.static(resolve(__dirname, 'dist'))
]

await startBot()

middlewere.forEach((it) => server.use(it))

server.get('/', (req, res) => {
  res.send('Express Server')
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }
  res.send(
    Html({
      body: '',
      initialState
    })
  )
})

server.listen(PORT, () => {
  console.log(`Serving at http://localhost${PORT}`)
})
