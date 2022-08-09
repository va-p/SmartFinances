const axios = require('axios').default;

const apiCryptoQuote = axios.create({
  baseURL: 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/',
  headers: {
    'X-CMC_PRO_API_KEY': '3ef088aa-adc2-4fca-98db-37acae821211',
  }
});

export default apiCryptoQuote;