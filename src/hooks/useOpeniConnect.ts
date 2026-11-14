import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';

import api from '@api/api';
import {
  BANKING_CALLBACK_URL,
  parseBankingCallback,
  type BankingCallbackParams,
} from '@utils/openiConnect';

export interface OpeniConnectSession {
  connectUrl: string;
  expiresAt: string;
}

async function fetchConnectSession(redirectUrl?: string): Promise<OpeniConnectSession> {
  const { data } = await api.get('/banking-integration/connect', {
    params: redirectUrl ? { redirectUrl } : undefined,
  });
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

/**
 * Opens the Connect widget in an auth session that auto-dismisses when the
 * widget redirects back to the app. Returns the parsed callback params, or
 * null when the user dismisses the session or the return URL is unusable.
 */
export async function openConnectSession(
  connectUrl: string
): Promise<BankingCallbackParams | null> {
  const result = await WebBrowser.openAuthSessionAsync(
    connectUrl,
    BANKING_CALLBACK_URL
  );
  if (result.type !== 'success' || !result.url) return null;
  return parseBankingCallback(result.url);
}
