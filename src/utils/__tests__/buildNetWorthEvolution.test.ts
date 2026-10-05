import { buildNetWorthEvolution } from '../buildNetWorthEvolution';

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

const makeTransaction = (
  overrides: Partial<{
    created_at: string | Date;
    amount: number;
    amount_in_account_currency: number | null;
    type: string;
    account: { currency: { code: string } } | null;
  }> = {}
) => ({
  created_at: '2026-08-10T12:00:00.000Z',
  amount: 50,
  type: 'DEBIT',
  account: { currency: { code: 'BRL' } },
  ...overrides,
});

describe('buildNetWorthEvolution', () => {
  // WEEK-08 — weeks mode groups net flows by ISO week, oldest to newest, ending at totalAssets
  it('groups net flows by ISO week and ends exactly at totalAssets', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ created_at: '2026-08-10T12:00:00.000Z', amount: 50, type: 'DEBIT' }), // ISO week 33: -50
        makeTransaction({ created_at: '2026-08-17T12:00:00.000Z', amount: 100, type: 'CREDIT' }), // ISO week 34: +100
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes,
    });

    // Initial net worth = 1000 - (-50 + 100) = 950; week 33: 950 - 50 = 900; week 34: 900 + 100 = 1000
    expect(result).toEqual([
      { date: 'Sem 33 \n 2026', total: 900 },
      { date: 'Sem 34 \n 2026', total: 1000 },
    ]);
  });

  // WEEK-09 — existing exclusion rules preserved in weeks mode
  it('excludes transfers and future-dated transactions', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ type: 'TRANSFER_DEBIT', amount: 999 }),
        makeTransaction({ created_at: '2099-01-05T12:00:00.000Z', amount: 1 }),
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes,
    });

    expect(result).toEqual([]);
  });

  // Edge case — ISO week-year differs from calendar year (2025-12-29 is ISO week 1 of 2026)
  it('labels a year-boundary week with its ISO week-year', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ created_at: '2025-12-29T12:00:00.000Z', amount: 100, type: 'CREDIT' }),
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes,
    });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('Sem 1 \n 2026');
    expect(result[0].total).toBe(1000);
  });

  // BC-25 — period flows convert to the base currency so every intermediate
  // point is consistent with the base-converted seed
  it('steps the series in converted values when base is USD', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ created_at: '2026-08-10T12:00:00.000Z', amount: 50, type: 'DEBIT' }), // -50 BRL -> -10 USD
        makeTransaction({ created_at: '2026-08-17T12:00:00.000Z', amount: 100, type: 'CREDIT' }), // +100 BRL -> +20 USD
      ],
      totalAssets: 200, // USD
      period: 'weeks',
      quotes,
      baseCurrencyCode: 'USD',
    });

    // Initial net worth = 200 - (-10 + 20) = 190; week 33: 190 - 10 = 180; week 34: 180 + 20 = 200
    expect(result).toEqual([
      { date: 'Sem 33 \n 2026', total: 180 },
      { date: 'Sem 34 \n 2026', total: 200 },
    ]);
  });

  // BC-24 — same-currency flows pass through without touching the quotes
  it('keeps BRL flows unchanged with base BRL and zero-price quotes', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ created_at: '2026-08-10T12:00:00.000Z', amount: 50, type: 'DEBIT' }), // ISO week 33
        makeTransaction({ created_at: '2026-08-17T12:00:00.000Z', amount: 100, type: 'CREDIT' }), // ISO week 34
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes: zeroQuotes,
    });

    // Initial = 1000 - (-50 + 100) = 950; week 33: 950 - 50 = 900; week 34: 1000
    expect(result).toEqual([
      { date: 'Sem 33 \n 2026', total: 900 },
      { date: 'Sem 34 \n 2026', total: 1000 },
    ]);
  });

  // BC-22 — amount_in_account_currency (account-currency value) wins over
  // the transaction-currency amount
  it('uses amount_in_account_currency when present', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ created_at: '2026-08-10T12:00:00.000Z', amount: 30, type: 'DEBIT' }), // ISO week 33: -30
        makeTransaction({
          created_at: '2026-08-17T12:00:00.000Z',
          amount: 100,
          amount_in_account_currency: 50,
          type: 'CREDIT',
        }), // ISO week 34: +50 (aic), not +100
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes,
    });

    // Initial = 1000 - (-30 + 50) = 980; week 33: 950; week 34: 1000.
    // (Using amount 100 instead would give week 33 = 900.)
    expect(result).toEqual([
      { date: 'Sem 33 \n 2026', total: 950 },
      { date: 'Sem 34 \n 2026', total: 1000 },
    ]);
  });

  // BC-23 — unsupported account currencies are skipped, never crash
  it('skips unsupported account currencies from the series', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({
          created_at: '2026-08-10T12:00:00.000Z',
          amount: 100,
          type: 'CREDIT',
        }), // ISO week 33: +100 BRL
        makeTransaction({
          created_at: '2026-08-17T12:00:00.000Z',
          amount: 7,
          type: 'CREDIT',
          account: { currency: { code: 'ETH' } },
        }), // ISO week 34: skipped
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes,
    });

    // the ETH flow contributes nothing: only week 33 exists, ending at 1000
    expect(result).toEqual([{ date: 'Sem 33 \n 2026', total: 1000 }]);
  });

  it('skips transactions without account data', () => {
    const result = buildNetWorthEvolution({
      transactions: [
        makeTransaction({ amount: 100, type: 'CREDIT', account: null }),
      ],
      totalAssets: 1000,
      period: 'weeks',
      quotes,
    });

    expect(result).toEqual([]);
  });
});
