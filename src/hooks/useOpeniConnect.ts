import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';

import api from '@api/api';

export interface OpeniConnectSession {
  connectUrl: string;
  expiresAt: string;
}

async function fetchConnectSession(): Promise<OpeniConnectSession> {
  const { data } = await api.get('/banking-integration/connect');
  return data;
}

/**
 * Creates an Openi connect session via the backend and opens the returned
 * `connectUrl` in the external browser (OAuth-safe, no embedded WebView).
 * The user returns through the `banking-callback` deep link.
 */
export function useOpeniConnect() {
  return useMutation({
    mutationFn: fetchConnectSession,
  });
}

export async function openConnectSession(connectUrl: string): Promise<void> {
  await WebBrowser.openBrowserAsync(connectUrl);
}
