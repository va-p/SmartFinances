import { buildNetWorthEvolution } from '../buildNetWorthEvolution';

const makeTransaction = (
  overrides: Partial<{
    created_at: string | Date;
    amount: number;
    amount_in_account_currency: number | null;
    type: string;
  }> = {}
) => ({
  created_at: '2026-08-10T12:00:00.000Z',
  amount: 50,
  type: 'DEBIT',
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
    });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('Sem 1 \n 2026');
    expect(result[0].total).toBe(1000);
  });
});
