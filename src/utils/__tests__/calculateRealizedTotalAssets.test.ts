import { calculateRealizedTotalAssets } from '../calculateRealizedTotalAssets';

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

const now = new Date('2026-11-02T12:00:00.000Z');
const dayMs = 24 * 60 * 60 * 1000;
const pastIso = new Date(now.getTime() - dayMs).toISOString();
const futureIso = new Date(now.getTime() + dayMs * 2).toISOString();

const makeAccount = (overrides = {}) => ({
  balance: 100,
  currency: { code: 'BRL' },
  ...overrides,
});

const makeTransaction = (overrides = {}) => ({
  created_at: pastIso,
  amount: 50,
  type: 'CREDIT',
  account: { currency: { code: 'BRL' } },
  ...overrides,
});

describe('calculateRealizedTotalAssets', () => {
  // FUT-05 — a future CREDIT inflates the balance sum, so it is backed out
  it('subtracts a future credit from the balance sum', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [makeTransaction({ created_at: futureIso, amount: 500 })],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    expect(total).toBe(500);
  });

  // FUT-05 — a future DEBIT already reduced the balance, so it is added back
  it('adds back a future debit to the balance sum', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [
        makeTransaction({
          created_at: futureIso,
          amount: -200,
          type: 'DEBIT',
        }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    expect(total).toBe(1200);
  });

  // FUT-05 — realized transactions never adjust the seed
  it('ignores past transactions', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [makeTransaction({ created_at: pastIso, amount: 500 })],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    expect(total).toBe(1000);
  });

  // FUT-05 — a transaction stamped exactly now counts as realized
  it('treats a transaction at exactly now as realized', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [
        makeTransaction({ created_at: now.toISOString(), amount: 500 }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    expect(total).toBe(1000);
  });

  // FUT-05 — transfers move money between accounts without changing net worth
  it('skips future transfers', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [
        makeTransaction({
          created_at: futureIso,
          amount: 500,
          type: 'TRANSFER_CREDIT',
        }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    expect(total).toBe(1000);
  });

  // FUT-07 — unsupported currencies skip like the period flows do
  it('skips future flows with unsupported account currencies', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [
        makeTransaction({
          created_at: futureIso,
          amount: 500,
          account: { currency: { code: 'ETH' } },
        }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    expect(total).toBe(1000);
  });

  // FUT-05 — foreign-currency futures convert before adjusting
  it('converts a foreign-currency future flow to the base currency', () => {
    const total = calculateRealizedTotalAssets({
      accounts: [makeAccount({ balance: 1000 })],
      transactions: [
        makeTransaction({
          created_at: futureIso,
          amount: 100,
          type: 'CREDIT',
          account: { currency: { code: 'USD' } },
        }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
      now,
    });

    // 100 USD x 5 = 500 BRL backed out of the 1000 balance sum
    expect(total).toBe(500);
  });
});
