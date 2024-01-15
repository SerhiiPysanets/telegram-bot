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

bot.on('message', async msg => {
  const text = msg.text.toLowerCase()
  const chatId = msg.chat.id
  const arrText = text.split('_')
  const textDate = arrText[2] ? `${arrText[2]}-${arrText[3]}-${arrText[4]}` : 'latest'
  const pattern = /^202[2-4]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

  const currency1 = arrText[0].slice(1)
  const currency2 = arrText[1] || 'uah'
  const newArrText = [currency1, currency2, textDate]

  if (textDate !== 'latest' && !pattern.test(textDate)) {
    await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/21.webp')
    return bot.sendMessage(chatId, `Invalid date`)
  }

  if (text === "/start") {
    await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/24.webp')
    return bot.sendMessage(chatId,
      `Hi! ${msg?.chat?.username }
      To find out the exchange rate Just write the currency code
      For example: /usd
      or: /usd_eur
      or: /btc_usd_2023_08_14
    `)
  }
  if (text === "/info") {
    return bot.sendMessage(chatId, `Features:
      150+ Currencies, including common cryptocurrencies,
      Exchange rate history for the last six months
      Daily rate updated`)
  }

  if (listCodeCurrencies.includes(newArrText[0]) && listCodeCurrencies.includes(newArrText[1]) ) {

    const url = `https://raw.githubusercontent.com/fawazahmed0/currency-api/1/${newArrText[2]}/currencies/${newArrText[0]}/${newArrText[1]}.min.json`
    const url1 = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${newArrText[2]}/currencies/${newArrText[0]}/${newArrText[1]}.min.json`
    const url2 = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${newArrText[0]}/${newArrText[1]}.json`


    const res = await axios(url).then(({ data }) => {
      return data
    }).catch((err) => console.log(err)).then((obj) => {
      if (!obj) {
        const newRes = axios(url1).then(({ data }) => {
          return data
        }).catch((err) => console.log(err)).then((dataObj) => {
          if (!dataObj) {
            const newRes = axios(url2).then(({ data }) => {
              return data
            }).catch((err) => console.log(err))
            return newRes
          }
          return dataObj
        })
        return newRes
      }
      return obj
    })

    return  bot.sendMessage(chatId,
      `${res?.date}
       ${newArrText[0].toUpperCase()} - ${newArrText[1].toUpperCase()}: ${res[newArrText[1]]}`)

  }
  await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/19.webp')
  return bot.sendMessage(chatId, `Incorrect currency code`)

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
