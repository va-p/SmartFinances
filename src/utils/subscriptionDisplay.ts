import {
  SubscriptionProps,
  SubscriptionRecurrencePeriod,
} from '@interfaces/subscriptions';

const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

/** "2026-08-06T…" → "6 AGO." (payment rows, no year, no zero-padding). */
export function formatShortDayMonth(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getDate()} ${MONTH_ABBREVIATIONS[date.getMonth()]}.`;
}

/** 'MONTHLY' → 'Mensal', 'YEARLY' → 'Anual', otherwise ''. */
export function subscriptionRecurrenceLabel(
  period: SubscriptionRecurrencePeriod | null | undefined
): string {
  switch (period) {
    case 'MONTHLY':
      return 'Mensal';
    case 'YEARLY':
      return 'Anual';
    default:
      return '';
  }
}

/** "Mensal · Dia 6" (empty when the recurrence is not set). */
export function subscriptionFrequencyText(
  subscription: Pick<SubscriptionProps, 'recurrence_period' | 'day'>
): string {
  const label = subscriptionRecurrenceLabel(subscription.recurrence_period);
  if (!label) return '';
  return `${label} · Dia ${subscription.day}`;
}
