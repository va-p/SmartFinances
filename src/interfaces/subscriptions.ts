import { CategoryProps } from './categories';
import { CurrencyProps } from './currencies';

export type SubscriptionRecurrencePeriod = 'MONTHLY' | 'YEARLY';

export interface SubscriptionProps {
  /** Parent transaction id. */
  id: number;
  description: string;
  amount: number;
  currency: CurrencyProps;
  category: CategoryProps;
  recurrence_period: SubscriptionRecurrencePeriod | null;
  recurrence_interval: number | null;
  /** Billing day of month (1–31). */
  day: number;
  next_payment_at: string | null;
  last_payment_at: string | null;
  is_subscription: boolean;
  hide_from_subscription_list: boolean;
}

export interface SubscriptionPaymentProps {
  subscription_id: number;
  description: string;
  amount: number;
  currency: CurrencyProps;
  category: CategoryProps;
  day: number;
  /** ISO occurrence date inside the selected month. */
  date: string;
  recurrence_period: SubscriptionRecurrencePeriod | null;
  is_paid: boolean;
}
