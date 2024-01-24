const buttonDelete = [{ text: "🗑", callback_data: "delete" }]

const  splitArray = (array, rowSize) => {
  const result = array.reduce((acc, rec) => {
    if (acc[acc.length - 1].length < rowSize) {
      acc[acc.length - 1] = [...acc[acc.length - 1], rec]
      return acc
    }
    return [...acc, [rec]]

  }, [[]])

  return result
}

const buttonsAlphabet = new Array(26).fill({}).map((obj, index) => {
  return { ...obj, text: String.fromCharCode(65 + index), callback_data: String.fromCharCode(97 + index) }
})

const inlineKeyboardAlphabet = splitArray(buttonsAlphabet, 6)

const currencyCodesOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [...inlineKeyboardAlphabet, buttonDelete ]
  })
}


const replyOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "💱 ", callback_data: "change_places" },
        { text: "📆", callback_data: "change_date" },
        { text: "🧮", callback_data: "calculator" },
      ...buttonDelete]
    ]
  })
}


const buttonsCalculator = new Array(9).fill(0).map((num, index) => {
  return num + index + 1
})
const addButtonsTobuttonsCalculator = [...buttonsCalculator, ".", "0", "<"].map((elem) => {
  return { text: elem, callback_data: elem + "calculator" }
})

const inlineKeyboardCalculator = splitArray(addButtonsTobuttonsCalculator, 3)


const optionCalculator = {

  reply_markup: JSON.stringify({
    inline_keyboard: [...inlineKeyboardCalculator, buttonDelete ]
  })
}

const deleteOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      buttonDelete
    ],
  })
}

const inlineKeyboardForDate = (numberOfButtons, rowSize, postfix) => {
  const post = postfix || ''
  const array = new Array(numberOfButtons).fill({}).map((obj, index) => {
    const str = `${index + 1}`.padStart(2, '0')
    return { ...obj, text: str, callback_data: str + post }
  })
  const result = splitArray(array, rowSize)
  return result
}

const optionsToLocaleString = {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export { currencyCodesOptions, replyOptions, deleteOptions, buttonDelete, inlineKeyboardForDate, optionsToLocaleString, optionCalculator }