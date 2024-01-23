const buttonDelete = [{ text: "🗑", callback_data: "delete" }]

const currencyCodesOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "A", callback_data: "a" }, { text: "B", callback_data: "b" }, { text: "C", callback_data: "c" }, { text: "D", callback_data: "d" }, { text: "E", callback_data: "e" }, { text: "F", callback_data: "f" }],
      [{ text: "G", callback_data: "g" }, { text: "H", callback_data: "h" }, { text: "I", callback_data: "i" }, { text: "J", callback_data: "j" }, { text: "K", callback_data: "k" }, { text: "L", callback_data: "l" }],
      [{ text: "M", callback_data: "m" }, { text: "N", callback_data: "n" }, { text: "O", callback_data: "o" }, { text: "P", callback_data: "p" }, { text: "Q", callback_data: "q" }, { text: "R", callback_data: "r" }],
      [{ text: "S", callback_data: "s" }, { text: "T", callback_data: "t" }, { text: "U", callback_data: "u" }, { text: "V", callback_data: "v" }, { text: "W", callback_data: "w" }, { text: "X", callback_data: "x" }],
      [{ text: "Y", callback_data: "y" }, { text: "Z", callback_data: "z" }],
      buttonDelete
    ],
  })
}

const replyOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "💱 ", callback_data: "change_places" },
        { text: "📆", callback_data: "change_date" },
        { text: "🧮", callback_data: "calculator" },
        { text: "🗑", callback_data: "delete" }
      ]
    ]
  })
}

const optionCalculator = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "1", callback_data: "1calculator" }, { text: "2", callback_data: "2calculator" }, { text: "3", callback_data: "3calculator" }],
      [{ text: "4", callback_data: "4calculator" }, { text: "5", callback_data: "5calculator" }, { text: "6", callback_data: "6calculator" }],
      [{ text: "7", callback_data: "7calculator" }, { text: "8", callback_data: "8calculator" }, { text: "9", callback_data: "9calculator" }],
      [{ text: ".", callback_data: ".calculator" }, { text: "0", callback_data: "0calculator" }, { text: "<", callback_data: "<calculator" }],
      buttonDelete

    ]
  })
}

const deleteOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      buttonDelete
    ],
  })
}

const inlineKeyboardForDate = (numberOfButtons, numberInRow, prefix) => {
  const postfix = prefix || ''
  const array = new Array(numberOfButtons).fill({}).map((obj, index) => {
    const str = `${index + 1}`.padStart(2, '0')
    return { ...obj, text: str, callback_data: str + postfix }
  })

  const result = array.reduce((acc, rec) => {
    if (acc[acc.length - 1].length < numberInRow) {
      acc[acc.length - 1] = [...acc[acc.length - 1], rec]
      return acc
    }
    return [...acc, [rec]]

  }, [[]])

  return result
}

const optionsToLocaleString = {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export { currencyCodesOptions, replyOptions, deleteOptions, buttonDelete, inlineKeyboardForDate, optionsToLocaleString, optionCalculator }