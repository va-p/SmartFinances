import axios, { AxiosInstance } from 'axios';

const apiQuotes: AxiosInstance = axios.create({
  baseURL: 'your_coinmarketcap_baseURL',
  headers: {
    'X-CMC_PRO_API_KEY': '095fd7bb-7d7c-4d11-82da-6a68fe950d77',
  },
});

export default apiQuotes;
