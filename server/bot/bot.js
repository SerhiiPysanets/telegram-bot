import TelegramApi from 'node-telegram-bot-api'
import axios from 'axios'

import { getRateFromApi, formatDate, stringToObjSudstrings, translator } from './common-funk.js'
import { arrStick, invalidDateStick, startStick, messageDevStick, errorComandStick } from './stickers.js'
import {
  currencyCodesOptions,
  replyOptions,
  deleteOptions,
  buttonDelete,
  inlineKeyboardForDate,
  optionsToLocaleString,
  optionCalculator
} from './options.js'

const startBot = async () => {

  const token = process.env.TG_TOKEN
  const myChatId = process.env.CHAT_ID

  const bot = new TelegramApi(token, { polling: true })

  const getRate = async (chatId, newArrText) => {
    const rate = await getRateFromApi(newArrText)
    return await bot.sendMessage(chatId,
      `${rate?.date}
${newArrText[0].toUpperCase()} - ${newArrText[1].toUpperCase()}: ${rate?.[newArrText[1]][newArrText[0]]}`, replyOptions)
  }

  const url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json'
  const getListCodeCurrencies = await axios(url).then(({ data }) => {
    return data
  }).catch((err) => console.log(err))

  const listCodeCurrencies = Object.keys(getListCodeCurrencies)

  const messageFromDev = async (myChatId, msg) => {
    await bot.sendMessage(myChatId, `chatId: ${msg?.chat?.id}
      username: @${msg?.chat?.username || ''}
      first_name: ${msg?.chat?.first_name || ''}
      last_name: ${msg?.chat?.last_name || ''}
      Date: ${new Date(msg?.date * 1000)}
      language_code : ${msg?.from?.language_code}
      text: ${msg?.text}

      `, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: "вул. І. Миколайчука, буд.1 ", url: `https://www.google.com/maps/search/${encodeURIComponent(" Ощадбанк, 58018, Чернівецька область, м.Чернівці, вул. І. Миколайчука, буд.1")}`}
          ]
        ]
      })
    })
  }

  bot.setMyCommands([
    { command: "/start", description: "initial command" },
    { command: "/info", description: "description of capabilities" },
    { command: "/help", description: "currency codes" }

  ])

  bot.on('message', async (msg) => {

    const text = typeof msg.text !== "string" ? "error" : msg.text.toLowerCase()
    const chatId = msg.chat.id
    const { language_code } = msg.from
    const messageId = msg.message_id
    const reply = msg.reply_to_message?.text
    const arrText = text.split('_')
    const getMsgDate = new Date(msg.date * 1000)
    const date = formatDate(getMsgDate)
    const textDate = arrText[2] ? `${arrText[2]}-${arrText[3]}-${arrText[4]}` : date

    const regexp = /^202[2-4]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    const regexpMassege = /^\/dev(.+)/
    const regexpRub = /^\/?(rub|byn|byr)/
    const regexpAmount = /^(0[\.,]([1-9]\d*|0+[1-9])+|[1-9]\d*)([.,]\d+)?$/

    const currency1 = arrText[0][0] === "/" ? arrText[0].slice(1) : arrText[0]
    const currency2 = arrText[1] || 'uah'
    const newArrText = [currency2, currency1, textDate]

    if (!regexp.test(textDate)) {

      await bot.sendSticker(chatId, invalidDateStick)
      return await bot.sendMessage(chatId, `Invalid date`)
    }

    if (regexpRub.test(text)) {

      const randomNumber = Math.floor(Math.random() * 10)

      return await bot.sendSticker(chatId, `${arrStick[randomNumber]}`)
    }

    if (text === "/start") {

      const textStart = ['Hi', 'To find out the exchange rate Just write the currency code.', 'Or select a code from the list',]
      const line = await translator(textStart, language_code)
      messageFromDev(myChatId,msg)
      await bot.sendSticker(chatId, startStick)
      return await bot.sendMessage(chatId,
        `${line[0]}! ${msg?.chat?.username || msg?.chat?.first_name}
${line[1]}
${line[2]}: /help`)
    }

    if (regexpAmount.test(text) && reply) {

      const { currency1, currency2, rate } = stringToObjSudstrings(reply)
      const textReplaceComma = text.replace(',', '.')
      const sum = (rate * textReplaceComma)
      const sumFormat = rate.includes("0.00") || rate.includes("e-")
        ? sum
        : sum.toLocaleString(language_code, optionsToLocaleString)
      const textFormat = textReplaceComma.includes("0.00")
        ? (+textReplaceComma)
        : (+textReplaceComma).toLocaleString(language_code, optionsToLocaleString)

      return await bot.sendMessage(chatId, `${currency2.toUpperCase()}: ${textFormat}
${currency1.toUpperCase()}: ${sumFormat}`, {
        ...deleteOptions,
        reply_to_message_id: messageId
      })
    }

    if (regexpAmount.test(text)) {

      const textReplyCalculatorError = ['Please', 'select your currency first']
      const line = await translator(textReplyCalculatorError, language_code)

      return await bot.sendMessage(chatId, `${line[0]},
    ${line[1]}`, currencyCodesOptions)
    }

    if (regexpMassege.test(text)) {

      messageFromDev(myChatId, msg)

      await bot.sendSticker(chatId, messageDevStick)

      const textMessageDev = ["Thank you, he's sleeping now, I'll tell him when he wakes up"]
      const line = await translator(textMessageDev, language_code)

      return await bot.sendMessage(chatId, `${line[0]}`, { reply_to_message_id: messageId })
    }
    if (text === "/info") {

      const textInfo = ["Features",
        "Daily rate updated",
        "Currencies, including common cryptocurrencies",
        "Exchange rate history for the last six months",
        "some dates may be missing.",
        "If there are no dates, you will receive current data",
        "A calculator",
        "Can be used in two ways",
        "Using buttons",
        "Reply to a message with the exchange rate. Write the amount",
        "To send a message to the developer, type the command",
        "your message"
      ]
      const line = await translator(textInfo, language_code)

      return await bot.sendMessage(chatId, `${line[0]}:
▪︎ ${line[1]},
▪︎ 150+ ${line[2]},
▪ ${line[3]}
    *︎ ${line[4]}
       ${line[5]}
▪ ${line[6]}
      ${line[7]}:
      1. ${line[8]}
      2. ${line[9]}


 ✍️
 ${line[10]}
 /dev < ${line[11]} >`, deleteOptions)
    }
    if (text === "/help") {

      const textHelp = ["Examples command",
        "will show the euro exchange rate",
        "will show the dollar to euro exchange rate",
        "will show Bitcoin dollar exchange rate on January 10, 24",
        "Select the first letter for the currency code"
      ]
      const line = await translator(textHelp, language_code)

      return await bot.sendMessage(chatId, `${line[0]}:
/eur  - ${line[1]}
/usd_eur -${line[2]}
/btc_usd_2024_01_10 -${line[3]}

${line[4]}:`, currencyCodesOptions)

    }

    if (listCodeCurrencies.includes(newArrText[0]) && listCodeCurrencies.includes(newArrText[1])) {

      return getRate(chatId, newArrText)

    }
    const textErrComand = ["Invalid command or currency code", "Select the first letter for the currency code"]
    const line = await translator(textErrComand, language_code)

    await bot.sendSticker(chatId, errorComandStick)
    return await bot.sendMessage(chatId, `${line[0]}
${line[1]}
  `, currencyCodesOptions)

  })

  bot.on('callback_query', async (msg) => {
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

      const { currency1, currency2 } = stringToObjSudstrings(text)

      const option = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: `${currentYear - 1}`, callback_data: `${currentYear - 1}` },
            { text: `${currentYear}`, callback_data: `${currentYear}` }],
            buttonDelete
          ]
        })
      }
      const textSelectYear = ["Select year"]
      const line = await translator(textSelectYear, language_code)

      return await bot.sendMessage(chatId, `${currency1.toUpperCase()} - ${currency2.toUpperCase()}
${line[0]}`, { reply_to_message_id: messageId, ...option })
    }

    if (regexpYear.test(data)) {
      const textSelectMonth = ["You chose", "Select month"]
      const line = await translator(textSelectMonth, language_code)

      const [currency1, currency2] = text.match(/([A-Z]{2,})/g)
      const numberOfMonths = (data != currentYear ? 12 : currentMonth)

      const keyboard = inlineKeyboardForDate(numberOfMonths, 4, 'm')

      const optionChoseMonth = {

        reply_markup: JSON.stringify({
          inline_keyboard: [...keyboard, buttonDelete]
        })
      }

      await bot.deleteMessage(chatId, messageId)
      return await bot.sendMessage(chatId,
        `${currency1} - ${currency2}
${line[0]} ${data}
${line[1]}`, { reply_to_message_id: msg?.message?.reply_to_message?.message_id, ...optionChoseMonth })
    }

    if (regexpMonth.test(data)) {

      const [currency1, currency2] = text?.match(/([A-Z]{2,})/g)
      const [year] = text?.match(/\d{4}/)
      const monthCurr = '0' + currentMonth + 'm'

      console.log(text, currentMonth, data)

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
      const numberOfDay = currentYear == year && monthCurr === data ? currentDay : daysInMonth[data]
      const keyboard = inlineKeyboardForDate(numberOfDay, 7)

      const optionChoseDay = {
        reply_markup: JSON.stringify({
          inline_keyboard: [...keyboard, buttonDelete]
        })
      }
      const textSelectDay = ["You chose", "Select day"]
      const line = await translator(textSelectDay, language_code)

      await bot.deleteMessage(chatId, messageId)
      return await bot.sendMessage(chatId,
        `${currency1} - ${currency2}
${line[0]} ${year}-${data.slice(0, 2)}
${line[1]}`, { reply_to_message_id: msg?.message?.reply_to_message?.message_id, ...optionChoseDay })
    }

    if (regexpDay.test(data)) {
      const textChangDate = ["You changed the date to"]
      const line = await translator(textChangDate, language_code)

      const [currency1, currency2, choseDate] = text.match(/([A-Z]{2,})|(\d{4}-\d{2})/g)
      const newDate = `${choseDate}-${data}`
      const changeDate = [currency1.toLowerCase(), currency2.toLowerCase(), newDate]
      await bot.deleteMessage(chatId, messageId)
      await bot.sendMessage(chatId, `${line[0]} ${newDate}`, { reply_to_message_id: msg.message?.reply_to_message?.message_id })
      return getRate(chatId, changeDate)
    }

    if (data === 'calculator') {
      const { currency2, currency1, rate } = stringToObjSudstrings(text)

      return await bot.sendMessage(chatId, `Rate: ${rate}
${currency2.toUpperCase()}: ${'0'}
${currency1.toUpperCase()}: ${'0'}
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

}

export { startBot }