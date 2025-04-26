import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { storageToken } from '@database/database';

const api: AxiosInstance = axios.create({
  baseURL: 'you-base-url',
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    const jsonToken = storageToken.getString('token');
    if (jsonToken) {
      const loggedInUserAuthToken = JSON.parse(jsonToken);
      config.headers!.Authorization = `Bearer ${loggedInUserAuthToken}`;
    }
  } catch (error) {
    console.error('api error =>', error);
  }

  return config;
});

export default api;
