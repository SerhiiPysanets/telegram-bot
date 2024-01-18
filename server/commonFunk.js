import axios from 'axios'

const getRateFromApi = async ( newArrText ) => {

  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${newArrText[2]}/currencies/${newArrText[0]}/${newArrText[1]}.json`
  const url1 = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${newArrText[2]}/currencies/${newArrText[0]}/${newArrText[1]}.min.json`
  const url2 = `https://raw.githubusercontent.com/fawazahmed0/currency-api/1/latest/currencies/${newArrText[0]}/${newArrText[1]}.min.json`

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
  const day = date.getDate()
  return `${year}-${month}-${day}`
}


export { getRateFromApi, formatDate }