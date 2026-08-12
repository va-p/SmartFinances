import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { storageToken } from '@database/database';

import { getDeviceFingerprint } from '@utils/deviceFingerprint';

const api: AxiosInstance = axios.create({
  baseURL: 'you-base-url',
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    // Device fingerprint — unlocks the backend's full rate-limit budget
    // (100 req/15min instead of the strict 30 for fingerprint-less clients).
    config.headers!['X-Device-Fingerprint'] = getDeviceFingerprint();

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
