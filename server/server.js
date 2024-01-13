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

const getListCodeCurrencies = await axios('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.min.json').then(({ data }) => {
  return data
}).catch((err) => console.log(err))

const listCodeCurrencies = Object.keys(getListCodeCurrencies)

console.log(listCodeCurrencies.length)

bot.on('message', async msg => {
  const text = msg.text.toLowerCase()
  const chatId = msg.chat.id


  if (text === "/start") {
    await bot.sendMessage(chatId,
    `Hi! This is bot.
    Features:
      150+ Currencies, Including common cryptocurrencies,
      Daily rate updated`)
  }
  if (text === "/info") {
   await bot.sendMessage(chatId, `${msg?.chat?.username}`)
  }
  if (listCodeCurrencies.includes(text)) {
    const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${text}/uah.min.json`
    const res = await axios(url).then(({ data }) => {
      return data
    }).catch((err) => console.log(err))
    await bot.sendMessage(chatId,
      `${res?.date} UAH
       ${text.toUpperCase()}: ${res?.uah}`)

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
