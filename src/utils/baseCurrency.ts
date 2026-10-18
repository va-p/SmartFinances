import { CurrencyCodes, CurrencyProps } from '@interfaces/currencies';
import { convertCurrency } from '@utils/convertCurrency';

type Quotes = Parameters<typeof convertCurrency>[0]['quotes'];

// Quote matrix shape shared by the base-currency conversion helpers.
export type { Quotes };

// The app's default display currency — Brazilian Real, currency id 1
// (matches the backend seed and the test fixtures' currency shapes).
export const DEFAULT_BASE_CURRENCY: CurrencyProps = {
  id: 1,
  name: 'Brazilian Real',
  code: 'BRL',
  symbol: 'R$',
};

// formatCurrency and the quotes matrix only support these codes; the seeded
// currency list also carries ETH/USDC/USDT, which cannot back the base currency.
export const SUPPORTED_BASE_CURRENCY_CODES: readonly CurrencyCodes[] = [
  'BRL',
  'BTC',
  'EUR',
  'USD',
];

const supportedCodes = new Set<string>(SUPPORTED_BASE_CURRENCY_CODES);

export function isSupportedBaseCurrencyCode(
  code: unknown
): code is CurrencyCodes {
  return typeof code === 'string' && supportedCodes.has(code);
}

// Base currency candidates from the currencies store, unsupported codes
// dropped, original order preserved.
export function filterBaseCurrencyCandidates(
  currencies: CurrencyProps[]
): CurrencyProps[] {
  return currencies.filter((currency) =>
    isSupportedBaseCurrencyCode(currency.code)
  );
}

// Restores the persisted base currency (MMKV `config.baseCurrency`).
// Missing, corrupt, shape-invalid or unsupported values fall back to the
// default BRL currency.
export function parseStoredBaseCurrency(
  raw: string | undefined
): CurrencyProps {
  if (!raw) {
    return DEFAULT_BASE_CURRENCY;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as CurrencyProps).id === 'number' &&
      typeof (parsed as CurrencyProps).name === 'string' &&
      (parsed as CurrencyProps).name.length > 0 &&
      typeof (parsed as CurrencyProps).symbol === 'string' &&
      isSupportedBaseCurrencyCode((parsed as CurrencyProps).code)
    ) {
      return parsed as CurrencyProps;
    }
  } catch {
    // Corrupt storage falls back to the default below.
  }

  return DEFAULT_BASE_CURRENCY;
}

/**
 * Converts an amount denominated in `accountCurrency` to the base currency
 * before any aggregation sums it (BC-21). Same-currency amounts pass
 * through unchanged without touching the quotes, so the default BRL flow
 * works before the quotes query resolves (BC-24). Returns null for
 * unsupported pairs so callers skip the amount rather than crash (BC-23).
 */
export function convertToBaseCurrency(
  amount: number,
  accountCurrency: string,
  baseCurrencyCode: CurrencyCodes,
  quotes: Quotes
): number | null {
  if (accountCurrency === baseCurrencyCode) {
    return amount;
  }

  try {
    return convertCurrency({
      amount,
      fromCurrency: accountCurrency,
      toCurrency: baseCurrencyCode,
      accountCurrency,
      quotes,
    });
  } catch {
    return null;
  }
}
