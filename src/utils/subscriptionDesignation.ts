import { TransactionProps } from '@interfaces/transactions';

export type RecurrencePeriodValue = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const SUBSCRIPTION_PERIODS: RecurrencePeriodValue[] = ['MONTHLY', 'YEARLY'];

/** A subscription only exists with a MONTHLY or YEARLY recurrence. */
export function isSubscriptionRecurrencePeriod(
  period: string | null | undefined
): boolean {
  return SUBSCRIPTION_PERIODS.includes(period as RecurrencePeriodValue);
}

export type SubscriptionDesignationState = {
  isSubscription: boolean;
  isRecurring: boolean;
  recurrencePeriod: RecurrencePeriodValue;
};

export type SubscriptionSwitchResolution = SubscriptionDesignationState & {
  /** Whether the flip forced a recurrence fix the user should confirm. */
  needsRecurrenceModal: boolean;
};

/**
 * State after the "Assinatura" switch flips (SD-16/SD-17). Turning it on
 * forces the designation's requirements: recurring, with a MONTHLY/YEARLY
 * period (a non-qualifying period normalizes to MONTHLY), opening the
 * recurrence modal for confirmation whenever the prior state did not
 * already qualify.
 */
export function resolveSubscriptionSwitch(
  state: SubscriptionDesignationState,
  switchedOn: boolean
): SubscriptionSwitchResolution {
  if (!switchedOn) {
    return { ...state, isSubscription: false, needsRecurrenceModal: false };
  }

  const periodQualifies = isSubscriptionRecurrencePeriod(state.recurrencePeriod);
  return {
    ...state,
    isSubscription: true,
    isRecurring: true,
    recurrencePeriod: periodQualifies ? state.recurrencePeriod : 'MONTHLY',
    needsRecurrenceModal: !(state.isRecurring && periodQualifies),
  };
}

/**
 * State after the "Recorrente" switch flips (SD-18). Turning it off also
 * un-designates: a subscription cannot stay without recurrence.
 */
export function resolveRecurringSwitch(
  state: SubscriptionDesignationState,
  switchedOn: boolean
): SubscriptionDesignationState {
  if (switchedOn) {
    return { ...state, isRecurring: true };
  }
  return { ...state, isRecurring: false, isSubscription: false };
}

/**
 * State after RecurrenceSelect saves (SD-19). A DAILY/WEEKLY recurrence
 * un-designates; MONTHLY/YEARLY keeps the designation.
 */
export function resolveRecurrenceSaved(
  state: SubscriptionDesignationState,
  saved: { period: RecurrencePeriodValue }
): SubscriptionDesignationState {
  return {
    ...state,
    recurrencePeriod: saved.period,
    isSubscription:
      state.isSubscription && isSubscriptionRecurrencePeriod(saved.period),
  };
}

/**
 * Transactions offered when designating a subscription from existing ones
 * (SD-06): credit/debit only (transfers are internal movements, never
 * subscriptions) and not already designated.
 */
export function selectSubscriptionCandidates(
  transactions: TransactionProps[]
): TransactionProps[] {
  return transactions.filter(
    (transaction) =>
      (transaction.type === 'CREDIT' || transaction.type === 'DEBIT') &&
      !transaction.is_subscription
  );
}

/**
 * `is_subscription` field wiring (SD-22/SD-23/SD-24). Explicit `true` when
 * designated. Undesignated: omitted on create so the backend's
 * auto-classification of recurring monthly/yearly creates stands, explicit
 * `false` on edit so un-designating an existing subscription persists.
 */
export function buildSubscriptionDesignationPayload(
  isSubscription: boolean,
  mode: 'create' | 'edit'
): { is_subscription?: boolean } {
  if (isSubscription) {
    return { is_subscription: true };
  }
  return mode === 'edit' ? { is_subscription: false } : {};
}
