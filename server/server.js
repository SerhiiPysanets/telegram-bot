import express, { text } from 'express'
import cors from 'cors'
import config from './config.cjs'
import cookieParser from 'cookie-parser'
import { resolve } from 'path'
import TelegramApi from 'node-telegram-bot-api'
import axios from 'axios'

import { Html } from '../client/html.js'

const server = express()
const PORT = process.env.PORT || 8080
const __dirname = process.cwd()

const middlewere = [
  cors(),
  cookieParser(),
  express.json({ limit: '50kb' }),
  express.static(resolve(__dirname, 'dist'))
]

const token = process.env.TG_TOKEN

const bot = new TelegramApi(token, { polling: true })

bot.on('message', async msg => {
  const text = msg.text
  const chatId = msg.chat.id
  console.log(msg)

  if (text === "/start") {
    await bot.sendMessage(chatId, 'Hi! This is bot')
  }
  if (text === "/info") {
   await bot.sendMessage(chatId, `${msg?.chat?.username}`)
  }
  if (text === '/usd') {
    const res = await axios('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/2024-01-13/currencies/usd/uah.json').then(({ data }) => {
      return data
    }).catch((err) => console.log(err))
    await bot.sendMessage(chatId,
      `${res?.date} UAH
       USD: ${res?.uah}`)

  }
})



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
