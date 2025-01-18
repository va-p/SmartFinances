import axios from 'axios';

import { storageToken } from '@database/database';

const api = axios.create({
  baseURL: 'https://xjg3-npzd-66ef.b2.xano.io/api:ckiy-sBf',
});

api.interceptors.request.use(async (config: any) => {
  try {
    const jsonToken = storageToken.getString('token');
    if (jsonToken) {
      const loggedInUserAuthToken = JSON.parse(jsonToken);
      config.headers.Authorization = `Bearer ${loggedInUserAuthToken}`;
    }
  } catch (error) {
    console.error(error);
  }

  return config;
});

export default api;
