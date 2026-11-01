import { calculateTotalAssets } from '../calculateTotalAssets';

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

const makeAccount = (overrides = {}) => ({
  balance: 100,
  currency: { code: 'BRL' },
  ...overrides,
});

describe('calculateTotalAssets', () => {
  // NW-01 — shared seed: same-currency balances sum exactly
  it('sums same-currency balances without float noise', () => {
    const total = calculateTotalAssets({
      accounts: [
        makeAccount({ balance: 0.1 }),
        makeAccount({ balance: 0.2 }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
    });

    expect(total).toBe(0.3);
  });

  // NW-01 — hidden accounts never count toward net worth
  it('excludes hidden accounts', () => {
    const total = calculateTotalAssets({
      accounts: [
        makeAccount({ balance: 100 }),
        makeAccount({ balance: 999, hide: true }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
    });

    expect(total).toBe(100);
  });

  // NW-02 — cross-currency balances convert to the base before summing
  it('converts foreign balances to the base currency', () => {
    const total = calculateTotalAssets({
      accounts: [
        makeAccount({ balance: 100, currency: { code: 'BRL' } }),
        makeAccount({ balance: 10, currency: { code: 'USD' } }), // 10 * 5 = 50 BRL
      ],
      baseCurrencyCode: 'BRL',
      quotes,
    });

    expect(total).toBe(150);
  });

  // BC-23 — unsupported account currencies are skipped, never crash
  it('skips unsupported account currencies', () => {
    const total = calculateTotalAssets({
      accounts: [
        makeAccount({ balance: 100, currency: { code: 'BRL' } }),
        makeAccount({ balance: 7, currency: { code: 'ETH' } }),
      ],
      baseCurrencyCode: 'BRL',
      quotes,
    });

    expect(total).toBe(100);
  });
});
