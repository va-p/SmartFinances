import {
  DEFAULT_BASE_CURRENCY,
  SUPPORTED_BASE_CURRENCY_CODES,
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
