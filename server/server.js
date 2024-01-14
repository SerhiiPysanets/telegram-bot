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

const currentDate = new Date()

const formatDate = (date) => {

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getListCodeCurrencies = await axios('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.min.json').then(({ data }) => {
  return data
}).catch((err) => console.log(err))

const listCodeCurrencies = Object.keys(getListCodeCurrencies)

console.log(formatDate(currentDate))

bot.on('message', async msg => {
  const text = msg.text.toLowerCase()
  const chatId = msg.chat.id


  if (text === "/start") {
    return bot.sendMessage(chatId,
    `Hi! This is bot.
    Features:
      150+ Currencies, Including common cryptocurrencies,
      Daily rate updated`)
  }
  if (text === "/info") {
   return bot.sendMessage(chatId, `${msg?.chat?.username}`)
  }
  if (listCodeCurrencies.includes(text)) {
    const formatCurrentData = formatDate(currentDate)
    const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${formatCurrentData}/currencies/${text}/uah.min.json`
    const res = await axios(url).then(({ data }) => {
      return data
    }).catch((err) => console.log(err))
    return  bot.sendMessage(chatId,
      `${res?.date} UAH
       ${text.toUpperCase()}: ${res?.uah}`)

  }
  return bot.sendSticker(chatId,'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/19.webp')

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
