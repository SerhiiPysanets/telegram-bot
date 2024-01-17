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
      [{ text: "💱 ", callback_data: "change_places" }, { text: "📆", callback_data: "change_date" }, { text: "🧮", callback_data: "calculator" }],
    ],
  })
}

const deleteOptions = {

  reply_markup: JSON.stringify({
    inline_keyboard: [
      buttonDelete
    ],
  })
}

const arrStick = ["https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/6.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/10.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/12.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/15.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/24.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/37.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/40.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/79.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/93.webp",
  "https://tlgrm.eu/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/192/96.webp",
  "https://tlgrm.eu/_/stickers/1b5/0ab/1b50abf8-8451-40ca-be37-ffd7aa74ec4d/192/13.webp"
]

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

export { currencyCodesOptions, replyOptions, deleteOptions, arrStick, buttonDelete, inlineKeyboardForDate }