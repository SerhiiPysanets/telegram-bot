import express, { text } from 'express'
import cors from 'cors'
import config from './config.cjs'
import cookieParser from 'cookie-parser'
import { resolve } from 'path'
import TelegramApi from 'node-telegram-bot-api'
import axios from 'axios'

import { Html } from '../client/html.js'
import { currencyCodesOptions, replyOptions, deleteOptions, arrStick } from './options.js'
import { getRateFromApi } from './commonFunk.js'

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
const myChatId = process.env.CHAT_ID

const bot = new TelegramApi(token, { polling: true })

const getListCodeCurrencies = await axios('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.min.json').then(({ data }) => {
  return data
}).catch((err) => console.log(err))

const listCodeCurrencies = Object.keys(getListCodeCurrencies)

const getRate = async (chatId, newArrText) => {

  const rate = await getRateFromApi(newArrText)

  return await bot.sendMessage(chatId,
    `${rate?.date}
${newArrText[0].toUpperCase()} - ${newArrText[1].toUpperCase()}: ${rate[newArrText[1]]}`, replyOptions)
}

bot.setMyCommands([
  { command: "/start", description: "initial command" },
  { command: "/info", description: "description of capabilities" },
  { command: "/help", description: "currency codes" }

])

bot.on('message', async msg => {
  const text = msg.text.toLowerCase()
  const chatId = msg.chat.id
  const arrText = text.split('_')
  const textDate = arrText[2] ? `${arrText[2]}-${arrText[3]}-${arrText[4]}` : 'latest'
  const regexp = /^202[2-4]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

  const currency1 = arrText[0].slice(1)
  const currency2 = arrText[1] || 'uah'
  const newArrText = [currency1, currency2, textDate]

  if (textDate !== 'latest' && !regexp.test(textDate)) {
    await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/21.webp')
    return await bot.sendMessage(chatId, `Invalid date`)
  }

  if (text === "/rub" || text === "/byn" || text === "/byr") {

    const randomNumber = Math.floor(Math.random() * 10)

    return await bot.sendSticker(chatId, `${arrStick[randomNumber]}`)
  }

  if (text === "/start") {

    await bot.sendMessage(myChatId, `${msg.chat.username}
    ${msg.chat.first_name} ${msg.chat.last_name}
    ${new Date(msg.date * 1000)}
    ${msg.from.language_code}`)

    await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/24.webp')
    return await bot.sendMessage(chatId,
      `Hi! ${msg?.chat?.username }
      To find out the exchange rate Just write the currency code
      For example: /usd
      or: /usd_eur
      or: /btc_usd_2023_08_14
    `)
  }
  if (text === "/info") {
    return await bot.sendMessage(chatId, `Features:
      150+ Currencies, including common cryptocurrencies,
      Exchange rate history for the last six months
      Daily rate updated
      Exemple comand:
      /eur  - will show the euro to Ukrainian hryvnia exchange rate
      /usd_eur - will show the dollar to euro exchange rate
      /btc_usd_2024_01_10 -will show the bitcoin to dollar rate on January 10, 24`)
  }
  if (text === "/help") {

    return await bot.sendMessage(chatId, `Select the first letter for the currency code`, currencyCodesOptions)

  }

  if (listCodeCurrencies.includes(newArrText[0]) && listCodeCurrencies.includes(newArrText[1]) && text[0] === "/") {

    return getRate(chatId, newArrText)

  }

  await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/19.webp')
  return await bot.sendMessage(chatId, `Incorrect currency code
  Select the first letter for the currency code
  `, currencyCodesOptions)

})

bot.on('callback_query', async(msg) => {
  const data = msg.data
  const chatId = msg.message.chat.id
  const messageId = msg.message.message_id
  const { text } = msg.message
  const regexp = /^[a-z]$/

  const stringToObjSudstrings = (string) => {
    const str = string.split('-')
    const date = string.slice(0,10)
    return {
      currency1: str[2]?.slice(3).trim().toLowerCase(),
      currency2: str[3].trim().split(':')[0].toLowerCase(),
      date
    }
  }

  console.log(msg)

  if (regexp.test(data)) {
    const listCode = listCodeCurrencies.reduce((acc, rec) => {
      if (rec[0] === data) {
        return acc + `/${rec} --- ${getListCodeCurrencies[rec]} \n`
      }
      return acc
    }, ``)

    return await bot.sendMessage(chatId, `${listCode}`, deleteOptions)
  }

  if (data === 'change_places') {
    const { currency1, currency2, date} = stringToObjSudstrings(text)
    const changePlace = [currency2, currency1, date]
    return getRate(chatId, changePlace)
  }

  if (data === 'delete') {
    return await bot.deleteMessage(chatId, messageId)
  }

  return await bot.sendMessage(chatId, `${data}`, deleteOptions)
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
