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

/** Manual rows stay empty without recurrence; synced rows explain the missing forecast. */
export function subscriptionFrequencyText(
  subscription: Pick<SubscriptionProps, 'source' | 'recurrence_period' | 'day'>
): string {
  const label = subscriptionRecurrenceLabel(subscription.recurrence_period);
  if (!label) {
    return subscription.source === 'SYNCED'
      ? 'Sem previsão da próxima cobrança'
      : '';
  }
  return `${label} · Dia ${subscription.day}`;
}
