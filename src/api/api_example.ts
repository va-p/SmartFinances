import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { storageToken } from '@database/database';

import { getDeviceFingerprint } from '@utils/deviceFingerprint';

const api: AxiosInstance = axios.create({
  baseURL: 'you-base-url',
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    config.headers = config.headers ?? {};

    // Device fingerprint — unlocks the backend's full rate-limit budget
    // (100 req/15min instead of the strict 30 for fingerprint-less clients).
    config.headers['X-Device-Fingerprint'] = getDeviceFingerprint();

    const jsonToken = storageToken.getString('token');
    if (jsonToken) {
      const loggedInUserAuthToken = JSON.parse(jsonToken);
      config.headers.Authorization = `Bearer ${loggedInUserAuthToken}`;
    }
  } catch {
    // header optional — continue the request without it
  }

  return config;
});

export default api;
