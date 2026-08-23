import {
  SubscriptionProps,
  SubscriptionRecurrencePeriod,
} from '@interfaces/subscriptions';

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
