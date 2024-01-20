import express, { text } from 'express'
import cors from 'cors'
import config from './config.cjs'
import cookieParser from 'cookie-parser'
import { resolve } from 'path'
import TelegramApi from 'node-telegram-bot-api'
import axios from 'axios'

import { Html } from '../client/html.js'
import {
  currencyCodesOptions,
  replyOptions,
  deleteOptions,
  arrStick,
  buttonDelete,
  inlineKeyboardForDate,
  optionsToLocaleString,
  optionCalculator
} from './options.js'

import { getRateFromApi, formatDate, stringToObjSudstrings } from './commonFunk.js'

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

const url = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.min.json'

const getListCodeCurrencies = await axios(url).then(({ data }) => {
  return data
}).catch((err) => console.log(err))

const listCodeCurrencies = Object.keys(getListCodeCurrencies)

const getRate = async (chatId, newArrText) => {

  const rate = await getRateFromApi(newArrText)

  return await bot.sendMessage(chatId,
    `${rate?.date}
${newArrText[0].toUpperCase()} - ${newArrText[1].toUpperCase()}: ${rate?.[newArrText[1]]}`, replyOptions)
}

bot.setMyCommands([
  { command: "/start", description: "initial command" },
  { command: "/info", description: "description of capabilities" },
  { command: "/help", description: "currency codes" }

])

bot.on('message', async (msg) => {
  const text = msg.text.toLowerCase()
  const chatId = msg.chat.id
  const { language_code } = msg.from
  const messageId = msg.message_id
  const reply = msg.reply_to_message?.text
console.log(msg)
  const arrText = text.split('_')
  const getMsgDate = new Date(msg.date * 1000)
  const date = formatDate(getMsgDate)
  const textDate = arrText[2] ? `${arrText[2]}-${arrText[3]}-${arrText[4]}` : date

  const regexp = /^202[2-4]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  const regexpMassege = /^\/dev(.+)/
  const regexpRub = /^\/?(rub|byn|byr)/
  const regexpAmount = /^(0[\.,]([1-9]\d*|0+[1-9])+|[1-9]\d*)([.,]\d\d?)?$/

  const currency1 = arrText[0][0] === "/" ? arrText[0].slice(1) : arrText[0]
  const currency2 = arrText[1] || 'uah'
  const newArrText = [currency1, currency2, textDate]

  if (!regexp.test(textDate)) {

    await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/21.webp')
    return await bot.sendMessage(chatId, `Invalid date`)
  }

  if (regexpRub.test(text)) {

    const randomNumber = Math.floor(Math.random() * 10)

    return await bot.sendSticker(chatId, `${arrStick[randomNumber]}`)
  }

  if (text === "/start") {

    await bot.sendMessage(myChatId, `${chatId}
    ${msg.chat.username}
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

  if (regexpAmount.test(text) && reply) {

    const { currency1, currency2, rate } = stringToObjSudstrings(reply)

    const sum = (rate * text)
    const sumFormat = rate.includes("0.00") || rate.includes("e-") ? sum : sum.toLocaleString(language_code, optionsToLocaleString)

    return await bot.sendMessage(chatId, `${currency1.toUpperCase()}: ${(+text).toLocaleString(language_code, optionsToLocaleString) }
${currency2.toUpperCase()}: ${sumFormat}`, {...deleteOptions,
      reply_to_message_id: messageId
    })
  }

  if (regexpAmount.test(text)) {
    return await bot.sendMessage(chatId, `Please,
select your currency first`, currencyCodesOptions)
  }

  if (regexpMassege.test(text)) {

    await bot.sendMessage(myChatId, `${chatId}
    ${msg.chat.username}
    ${msg.chat.first_name} ${msg.chat.last_name}
    ${new Date(msg.date * 1000)}
    ${msg.from.language_code}
    ${msg.text}
    `)

    await bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/32.webp")

    return await bot.sendMessage(chatId, `Thank you, he's sleeping now, I'll tell him when he wakes up`, { reply_to_message_id: messageId })
  }
  if (text === "/info") {
    return await bot.sendMessage(chatId, `Features:
▪︎ Daily rate updated,
▪︎ 150+ Currencies, including common cryptocurrencies,
▪ Exchange rate history for the last six months
    *︎ some dates may be missing.
       If there are no dates, you will receive current data
▪ Added a calculator(2024-01-20)

 ✍️
 To send a message to the developer, type the command
 /dev < then your message >`, deleteOptions)
  }
  if (text === "/help") {

    return await bot.sendMessage(chatId, `Exemple comand:
/eur  - will show the euro to Ukrainian hryvnia exchange rate
/usd_eur - will show the dollar to euro exchange rate
/btc_usd_2024_01_10 -will show the bitcoin to dollar rate on January 10, 24

Select the first letter for the currency code:`, currencyCodesOptions)

  }

  if (listCodeCurrencies.includes(newArrText[0]) && listCodeCurrencies.includes(newArrText[1])) {

    return getRate(chatId, newArrText)

  }

  await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/306/6e2/3066e228-42a5-31a3-8507-cf303d3e7afe/192/19.webp')
  return await bot.sendMessage(chatId, `Invalid command or currency code
Select the first letter for the currency code
  `, currencyCodesOptions)

})

bot.on('callback_query', async(msg) => {
  const data = msg?.data
  const chatId = msg?.message?.chat?.id
  const messageId = msg?.message?.message_id
  const { language_code } = msg?.from
  const { text } = msg?.message
  const { date } = msg?.message

  const currentDate = new Date(date * 1000)
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentDay = currentDate.getDate()

  const regexp = /^[a-z]$/
  const regexpYear = /^\d{4}$/
  const regexpMonth = /^\d{2}m$/
  const regexpDay = /^\d{2}$/
  const regexpCalculator = /^(\d|\.|<)calculator$/

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

    const { currency1, currency2, date } = stringToObjSudstrings(text)
    const changePlace = [currency2, currency1, date]
    return getRate(chatId, changePlace)
  }

  if (data === 'change_date') {

   const  { currency1, currency2 } = stringToObjSudstrings(text)

    const option = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: `${currentYear - 1}`, callback_data: `${currentYear - 1}` },
           { text: `${currentYear}`, callback_data: `${currentYear}` }],
          buttonDelete
        ]
      })
    }

    return await bot.sendMessage(chatId, `${currency1.toUpperCase()} - ${currency2.toUpperCase()}
Select year
      `, { reply_to_message_id: messageId, ...option })
  }

  if (regexpYear.test(data)) {
    const [currency1, currency2] = text.match(/([A-Z]{2,})/g)
    const numberOfMonths = (data != currentYear ? 12 : currentMonth)

    const keyboard = inlineKeyboardForDate(numberOfMonths,4,'m')

    const optionChoseMonth = {

      reply_markup: JSON.stringify({
        inline_keyboard: [...keyboard, buttonDelete]
      })
    }

    await bot.deleteMessage(chatId, messageId)
    return await bot.sendMessage(chatId,
      `${currency1} - ${currency2}
You chose ${data}
Select month`, { reply_to_message_id: msg?.message?.reply_to_message?.message_id, ...optionChoseMonth })
  }

  if (regexpMonth.test(data)) {

    const [currency1, currency2] = text.match(/([A-Z]{2,})/g)
    const newMessage = text.slice(-28, -13)
    const year = newMessage.slice(-4)

    const daysInMonth = {
      "01m": 31,
      "02m": (2024 - year) % 4 === 0 ? 29 : 28,
      "03m": 31,
      "04m": 30,
      "05m": 31,
      "06m": 30,
      "07m": 31,
      "08m": 31,
      "09m": 30,
      "10m": 31,
      "11m": 30,
      "12m": 31
    }
    const numberOfDay = currentYear == year ? currentDay : daysInMonth[data]
    const keyboard = inlineKeyboardForDate(numberOfDay, 7)

    const optionChoseDay = {
      reply_markup: JSON.stringify({
        inline_keyboard: [...keyboard, buttonDelete]
      })
    }
    await bot.deleteMessage(chatId, messageId)
    return await bot.sendMessage(chatId,
      `${currency1} - ${currency2}
${newMessage}-${data.slice(0, 2)}
Select day`, { reply_to_message_id: msg?.message?.reply_to_message?.message_id, ...optionChoseDay })

  }

  if (regexpDay.test(data)) {

    const [currency1, currency2, choseDate] = text.match(/([A-Z]{2,})|(\d{4}-\d{2})/g)
    const newDate = `${choseDate}-${data}`
    const changeDate = [currency1.toLowerCase(), currency2.toLowerCase(), newDate]
    await bot.deleteMessage(chatId, messageId)
    await bot.sendMessage(chatId, `You changed the date to ${newDate}`, { reply_to_message_id: msg.message?.reply_to_message?.message_id})
    return getRate(chatId, changeDate)

  }

  if (data === 'calculator') {
    const { currency1, currency2,rate } = stringToObjSudstrings(text)

    return await bot.sendMessage(chatId, `Rate: ${rate}
${currency1.toUpperCase()}: ${'0'}
${currency2.toUpperCase()}: ${'0'}
`, { ...optionCalculator, reply_to_message_id: messageId })
  }

  if (regexpCalculator.test(data)) {

    const regexpSum = /([A-Z]{2,})|(\d+[\.,]\d+[e]-\d+|\d+[\.,]\d*|\d+)/g
    const num = data.slice(0, -10)
    const [rate, currency1, getValue1, currency2] = text.match(regexpSum)

    if (getValue1.length === 1 && num === "<") {

      return await bot.deleteMessage(chatId, messageId)

    } else {

      const newVelue1 = num === "<" ? getValue1.slice(0, -1) : getValue1 + num
      const newVelue2 = rate * (+newVelue1)
      const value1 = (num === "." || num === "0") ? newVelue1 : +newVelue1
      const value2 = rate.includes("0.00") || rate.includes("e-") ? newVelue2 : newVelue2.toLocaleString(language_code, optionsToLocaleString)
      console.log(getValue1, num, getValue1.length)

      return await bot.editMessageText(`Rate: ${rate}
${currency1}: ${value1}
${currency2}: ${value2}
    `, {
        chat_id: chatId,
        message_id: messageId,
        ...optionCalculator
      })
    }
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
