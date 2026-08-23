import {
  computePaymentsTotal,
  convertAmountToBRL,
  getUpcomingPaymentsSummary,
} from '../subscriptionPaymentsSummary';

import { SubscriptionPaymentProps, SubscriptionProps } from '@interfaces/subscriptions';

// Spec-anchored tests (spec.md R10 / AC10.1-10.3). Assert the spec-defined
// outcomes: BRL totals and month/count aggregation.

const q = (price: number) => ({ price, last_updated: '' });

const quotes = {
  brlQuoteBtc: q(0.000001),
  brlQuoteEur: q(0.16),
  brlQuoteUsd: q(0.2),
  btcQuoteBrl: q(100000),
  btcQuoteEur: q(16000),
  btcQuoteUsd: q(20000),
  eurQuoteBrl: q(6.25),
  eurQuoteBtc: q(0.0001),
  eurQuoteUsd: q(1.25),
  usdQuoteBrl: q(5),
  usdQuoteBtc: q(0.00005),
  usdQuoteEur: q(0.8),
};

const localISO = (y: number, m: number, day: number) =>
  new Date(y, m - 1, day, 12).toISOString();

const makeSubscription = (
  overrides: Partial<SubscriptionProps> = {},
): SubscriptionProps => ({
  id: 1,
  description: 'Amazon Prime',
  amount: 19.9,
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    icon: { id: 'i1', name: 'play' },
    color: { id: 'c1', color_code: '#FFAA29' },
  },
  recurrence_period: 'MONTHLY',
  recurrence_interval: 1,
  day: 6,
  next_payment_at: localISO(2026, 8, 6),
  last_payment_at: localISO(2026, 7, 6),
  is_subscription: true,
  hide_from_subscription_list: false,
  ...overrides,
});

const makePayment = (
  overrides: Partial<SubscriptionPaymentProps> = {},
): SubscriptionPaymentProps => ({
  subscription_id: 1,
  description: 'Amazon Prime',
  amount: 19.9,
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    icon: { id: 'i1', name: 'play' },
    color: { id: 'c1', color_code: '#FFAA29' },
  },
  day: 6,
  date: localISO(2026, 8, 6),
  recurrence_period: 'MONTHLY',
  is_paid: false,
  ...overrides,
});

describe('convertAmountToBRL', () => {
  // AC10.1
  it('passes BRL amounts through unchanged', () => {
    expect(convertAmountToBRL(19.9, 'BRL', quotes)).toBe(19.9);
  });

  it('converts USD to BRL through the quote matrix', () => {
    expect(convertAmountToBRL(10, 'USD', quotes)).toBe(50);
  });

  it('throws for unsupported currency pairs', () => {
    expect(() => convertAmountToBRL(10, 'GBP' as any, quotes)).toThrow();
  });
});

describe('getUpcomingPaymentsSummary', () => {
  // AC10.2 — wireframe example: 19.90 + 59.90 = 79.80, 2 cobranças
  it('aggregates the next upcoming month total and count in BRL', () => {
    const summary = getUpcomingPaymentsSummary(
      [
        makeSubscription({ id: 1, description: 'Amazon Prime', amount: 19.9 }),
        makeSubscription({
          id: 2,
          description: 'Apple',
          amount: 59.9,
          next_payment_at: localISO(2026, 8, 7),
        }),
      ],
      quotes,
      new Date(2026, 6, 30), // Jul 30, 2026
    );

    expect(summary).toEqual({ month: '2026-08', count: 2, total: 79.8 });
  });

  it('ignores occurrences strictly in the past', () => {
    const summary = getUpcomingPaymentsSummary(
      [
        makeSubscription({ id: 1, next_payment_at: localISO(2026, 7, 6) }),
        makeSubscription({ id: 2, next_payment_at: localISO(2026, 8, 6) }),
      ],
      quotes,
      new Date(2026, 6, 30),
    );

    expect(summary).toEqual({ month: '2026-08', count: 1, total: 19.9 });
  });

  it('picks the earliest month with upcoming payments', () => {
    const summary = getUpcomingPaymentsSummary(
      [
        makeSubscription({ id: 1, next_payment_at: localISO(2026, 9, 6) }),
        makeSubscription({ id: 2, next_payment_at: localISO(2026, 8, 6) }),
      ],
      quotes,
      new Date(2026, 6, 30),
    );

    expect(summary?.month).toBe('2026-08');
  });

  it('keeps occurrences of the current month that are still ahead', () => {
    const summary = getUpcomingPaymentsSummary(
      [
        makeSubscription({ id: 1, next_payment_at: localISO(2026, 8, 6) }),
      ],
      quotes,
      new Date(2026, 7, 3), // Aug 3, 2026
    );

    expect(summary).toEqual({ month: '2026-08', count: 1, total: 19.9 });
  });

  it('returns null when there are no upcoming payments', () => {
    const summary = getUpcomingPaymentsSummary(
      [
        makeSubscription({ id: 1, next_payment_at: null }),
        makeSubscription({ id: 2, next_payment_at: localISO(2026, 1, 6) }),
      ],
      quotes,
      new Date(2026, 6, 30),
    );

    expect(summary).toBeNull();
  });

  it('skips subscriptions with unsupported currencies instead of crashing', () => {
    const summary = getUpcomingPaymentsSummary(
      [
        makeSubscription({ id: 1, amount: 19.9 }),
        makeSubscription({
          id: 2,
          amount: 10,
          currency: {
            id: 9,
            name: 'Libra',
            code: 'GBP' as any,
            symbol: '£',
          },
        }),
      ],
      quotes,
      new Date(2026, 6, 30),
    );

    expect(summary).toEqual({ month: '2026-08', count: 1, total: 19.9 });
  });
});

describe('computePaymentsTotal', () => {
  // AC10.3
  it('sums BRL-converted payment amounts', () => {
    const total = computePaymentsTotal(
      [
        makePayment({ amount: 19.9 }),
        makePayment({ subscription_id: 2, amount: 59.9 }),
      ],
      quotes,
    );

    expect(total).toBe(79.8);
  });

  it('converts non-BRL currencies through the quote matrix', () => {
    const total = computePaymentsTotal(
      [
        makePayment({
          amount: 10,
          currency: { id: 2, name: 'Dólar', code: 'USD', symbol: '$' },
        }),
      ],
      quotes,
    );

    expect(total).toBe(50);
  });

  it('skips unsupported currencies and returns 0 for an empty list', () => {
    expect(computePaymentsTotal([], quotes)).toBe(0);

    const total = computePaymentsTotal(
      [
        makePayment({
          amount: 10,
          currency: { id: 9, name: 'Libra', code: 'GBP' as any, symbol: '£' },
        }),
      ],
      quotes,
    );
    expect(total).toBe(0);
  });
});
