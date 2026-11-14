/**
 * Pure helpers for the Openi Connect flow (feature: openi-integration).
 *
 * The backend creates the session and returns only `connectUrl`; the app
 * opens it in the external browser and comes back through the
 * `banking-callback` deep link carrying `itemId` and `status`.
 * The API key never reaches this layer.
 */

export interface BankingCallbackParams {
  itemId: string;
  status: 'success' | 'error';
}

/** Deep-link target the backend uses as the widget `redirectUrl`. */
export const BANKING_CALLBACK_URL = 'com.vap.smartfinances://banking-callback';

/**
 * Validate raw `itemId`/`status` query params (expo-router delivers them
 * decoded already). Same acceptance rules as `parseBankingCallback`.
 */
export function validateCallbackParams(
  itemId: unknown,
  status: unknown
): BankingCallbackParams | null {
  if (typeof itemId !== 'string' || !itemId) return null;
  if (status !== 'success' && status !== 'error') return null;
  return { itemId, status };
}

/**
 * Extract `itemId` and `status` from a banking-callback URL. Accepts the
 * custom-scheme deep link and https universal links alike; returns null
 * when either parameter is missing or `status` is not success/error.
 */
export function parseBankingCallback(url: string): BankingCallbackParams | null {
  try {
    const queryIndex = url.indexOf('?');
    if (queryIndex < 0) return null;
    const params = new URLSearchParams(url.slice(queryIndex + 1));
    const itemId = params.get('itemId');
    const status = params.get('status');
    if (!itemId || (status !== 'success' && status !== 'error')) return null;
    return { itemId, status };
  } catch {
    return null;
  }
}
