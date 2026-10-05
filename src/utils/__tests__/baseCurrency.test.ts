import {
  DEFAULT_BASE_CURRENCY,
  SUPPORTED_BASE_CURRENCY_CODES,
  convertToBaseCurrency,
  filterBaseCurrencyCandidates,
  isSupportedBaseCurrencyCode,
  parseStoredBaseCurrency,
} from '../baseCurrency';

import { CurrencyProps } from '../../interfaces/currencies';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;
const btc = { id: 2, name: 'Bitcoin', code: 'BTC', symbol: '₿' } as const;
const eur = { id: 3, name: 'Euro', code: 'EUR', symbol: '€' } as const;
const usd = { id: 5, name: 'US Dollar', code: 'USD', symbol: '$' } as const;
const eth = { id: 4, name: 'Ethereum', code: 'ETH', symbol: 'Ξ' } as const;
const usdt = { id: 7, name: 'Tether', code: 'USDT', symbol: '₮' } as const;

const zeroQuotes = {
  brlQuoteBtc: { price: 0 },
  brlQuoteEur: { price: 0 },
  brlQuoteUsd: { price: 0 },
  btcQuoteBrl: { price: 0 },
  btcQuoteEur: { price: 0 },
  btcQuoteUsd: { price: 0 },
  eurQuoteBrl: { price: 0 },
  eurQuoteBtc: { price: 0 },
  eurQuoteUsd: { price: 0 },
  usdQuoteBrl: { price: 0 },
  usdQuoteBtc: { price: 0 },
  usdQuoteEur: { price: 0 },
};

const quotes = {
  brlQuoteBtc: { price: 0.000003 },
  brlQuoteEur: { price: 0.16 },
  brlQuoteUsd: { price: 0.2 },
  btcQuoteBrl: { price: 300000 },
  btcQuoteEur: { price: 48000 },
  btcQuoteUsd: { price: 60000 },
  eurQuoteBrl: { price: 6.25 },
  eurQuoteBtc: { price: 0.00002 },
  eurQuoteUsd: { price: 1.25 },
  usdQuoteBrl: { price: 5 },
  usdQuoteBtc: { price: 0.000016 },
  usdQuoteEur: { price: 0.8 },
};

describe('convertToBaseCurrency', () => {
  // BC-24 — same-currency amounts pass through without touching the quotes
  it('passes same-currency amounts through unchanged with zero-price quotes', () => {
    expect(convertToBaseCurrency(19.9, 'BRL', 'BRL', zeroQuotes)).toBe(19.9);
    expect(convertToBaseCurrency(-50.5, 'USD', 'USD', zeroQuotes)).toBe(-50.5);
  });

  // BC-21 — cross-currency amounts convert through the quote matrix
  it('converts a BRL amount to USD through the quote matrix', () => {
    expect(convertToBaseCurrency(-50, 'BRL', 'USD', quotes)).toBe(-10);
    expect(convertToBaseCurrency(100, 'BRL', 'USD', quotes)).toBe(20);
  });

  // BC-23 — unsupported pairs return null so callers skip, never crash
  it('returns null for unsupported currency pairs', () => {
    expect(convertToBaseCurrency(10, 'ETH', 'USD', quotes)).toBeNull();
  });
});

describe('baseCurrency domain helpers', () => {
  // BC-01 — the default base currency is Brazilian Real, currency id 1
  it('defaults the base currency to Brazilian Real (id 1, BRL, R$)', () => {
    expect(DEFAULT_BASE_CURRENCY).toEqual({
      id: 1,
      name: 'Brazilian Real',
      code: 'BRL',
      symbol: 'R$',
    });
  });

  // BC-05 — only quote/format-supported codes can back the base currency
  it('lists exactly the supported base currency codes', () => {
    expect(SUPPORTED_BASE_CURRENCY_CODES).toEqual(['BRL', 'BTC', 'EUR', 'USD']);
  });

  it('narrows supported codes and rejects anything else', () => {
    expect(isSupportedBaseCurrencyCode('BRL')).toBe(true);
    expect(isSupportedBaseCurrencyCode('USD')).toBe(true);
    expect(isSupportedBaseCurrencyCode('USDT')).toBe(false);
    expect(isSupportedBaseCurrencyCode(undefined)).toBe(false);
    expect(isSupportedBaseCurrencyCode({ code: 'BRL' })).toBe(false);
  });

  // BC-05 — candidates come from the currency list, unsupported codes dropped,
  // original order preserved
  it('filters candidates to supported codes preserving order', () => {
    const list = [brl, eth, usd, usdt, eur, btc] as CurrencyProps[];

    expect(filterBaseCurrencyCandidates(list)).toEqual([brl, usd, eur, btc]);
  });

  it('returns an empty candidate list when the store has no supported currency', () => {
    expect(filterBaseCurrencyCandidates([eth, usdt] as CurrencyProps[])).toEqual([]);
  });

  // BC-03 — a valid, supported persisted value is restored as-is
  it('restores a valid persisted base currency', () => {
    const stored = JSON.stringify(usd);

    expect(parseStoredBaseCurrency(stored)).toEqual(usd);
  });

  it('restores the default when nothing is persisted', () => {
    expect(parseStoredBaseCurrency(undefined)).toEqual(DEFAULT_BASE_CURRENCY);
    expect(parseStoredBaseCurrency('')).toEqual(DEFAULT_BASE_CURRENCY);
  });

  // BC-04 — corrupt, shape-invalid or unsupported stored values fall back to BRL
  it('falls back to the default on unparseable JSON', () => {
    expect(parseStoredBaseCurrency('not-json{')).toEqual(DEFAULT_BASE_CURRENCY);
  });

  it('falls back to the default on a wrong-shaped object', () => {
    expect(
      parseStoredBaseCurrency(JSON.stringify({ id: '1', code: 'BRL' }))
    ).toEqual(DEFAULT_BASE_CURRENCY);
    expect(
      parseStoredBaseCurrency(JSON.stringify({ id: 1, code: 'BRL' }))
    ).toEqual(DEFAULT_BASE_CURRENCY);
    expect(
      parseStoredBaseCurrency(JSON.stringify({ ...usd, name: '' }))
    ).toEqual(DEFAULT_BASE_CURRENCY);
  });

  it('falls back to the default on an unsupported stored code', () => {
    expect(
      parseStoredBaseCurrency(JSON.stringify(usdt))
    ).toEqual(DEFAULT_BASE_CURRENCY);
  });
});
