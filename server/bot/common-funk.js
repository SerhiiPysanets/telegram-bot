import axios from 'axios'
import translate from "google-translate-api-next"

const getRateFromApi = async (arr) => {

  const newArrText = arr.map((str) => str.toLowerCase())

  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${newArrText[2]}/v1/currencies/${newArrText[1]}.json`
  const url1 = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${newArrText[2]}/v1/currencies/${newArrText[1]}.min.json`
  const url2 = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${newArrText[1]}.json`

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

  return res
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const stringToObjSudstrings = (string) => {

  const regexp = /(\d{4}-\d{2}-\d{2})|([a-z]+)|(\d.*$)/g

  const [date, currency1, currency2, rate] = (string?.toLowerCase().match(regexp))
  return { date, currency1, currency2, rate }

}

const translator = async (arrText, languageCode) => {

  if (languageCode !== 'en') {

    const textStartTrans = await translate(arrText, { from: 'en', to: languageCode }).then((arr) => {
      return arr.map((obj) => obj.text)
    }).catch((err) => console.log(err))

    return textStartTrans || arrText
  }
  return arrText
}

export { getRateFromApi, formatDate, stringToObjSudstrings, translator }