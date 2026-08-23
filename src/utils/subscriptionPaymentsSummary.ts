import { convertCurrency } from './convertCurrency';
import { monthKey } from './buildSubscriptionPeriodOptions';

import {
  SubscriptionPaymentProps,
  SubscriptionProps,
} from '@interfaces/subscriptions';

type Quotes = Parameters<typeof convertCurrency>[0]['quotes'];

export type UpcomingPaymentsSummary = {
  /** Month key (YYYY-MM) of the next month with upcoming payments. */
  month: string;
  count: number;
  /** BRL-converted total of that month's upcoming payments. */
  total: number;
};

const round2 = (value: number) => Number(value.toFixed(2));

/**
 * AC10.1 — converts an amount to BRL using the app's quote matrix. Throws
 * for unsupported currency pairs; callers skip those items rather than crash.
 */
export function convertAmountToBRL(
  amount: number,
  currencyCode: string,
  quotes: Quotes,
): number {
  return convertCurrency({
    amount,
    fromCurrency: currencyCode,
    toCurrency: 'BRL',
    accountCurrency: currencyCode,
    quotes,
  });
}

/**
 * AC10.2 — aggregates the next upcoming month's payments: the earliest month
 * (by each subscription's `next_payment_at`) that still has occurrences in
 * the future, with the BRL-converted total and count. Returns null when there
 * are no upcoming payments.
 */
export function getUpcomingPaymentsSummary(
  subscriptions: SubscriptionProps[],
  quotes: Quotes,
  now: Date = new Date(),
): UpcomingPaymentsSummary | null {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const upcoming: Array<{ month: string; amount: number }> = [];

  for (const subscription of subscriptions) {
    if (!subscription.next_payment_at) continue;
    const nextAt = new Date(subscription.next_payment_at);
    if (nextAt < startOfToday) continue;

    try {
      const brl = convertAmountToBRL(
        subscription.amount,
        subscription.currency.code,
        quotes,
      );
      upcoming.push({ month: monthKey(nextAt), amount: brl });
    } catch {
      // Unsupported currency pair: skip this subscription.
    }
  }

  if (upcoming.length === 0) return null;

  const targetMonth = [...new Set(upcoming.map((item) => item.month))].sort()[0];
  const inMonth = upcoming.filter((item) => item.month === targetMonth);

  return {
    month: targetMonth,
    count: inMonth.length,
    total: round2(inMonth.reduce((sum, item) => sum + item.amount, 0)),
  };
}

/**
 * AC10.3 — BRL-converted total of a month's payment occurrences. Unsupported
 * currency pairs are skipped, never thrown.
 */
export function computePaymentsTotal(
  payments: SubscriptionPaymentProps[],
  quotes: Quotes,
): number {
  let total = 0;

  for (const payment of payments) {
    try {
      total += convertAmountToBRL(
        payment.amount,
        payment.currency.code,
        quotes,
      );
    } catch {
      // Unsupported currency pair: skip this payment.
    }
  }

  return round2(total);
}
