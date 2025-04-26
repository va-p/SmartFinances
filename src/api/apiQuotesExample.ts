import axios, { AxiosInstance } from 'axios';

const apiQuotes: AxiosInstance = axios.create({
  baseURL: 'https://pro-api.coinmarketcap.com',
  headers: {
    'X-CMC_PRO_API_KEY': 'your_coinmarketcap_key',
  },
});

export default apiQuotes;
