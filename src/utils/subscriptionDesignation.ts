import { TransactionProps } from '@interfaces/transactions';
import { isHiddenAccountTransaction } from '@utils/hiddenAccounts';

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
 * State after the "Assinatura" switch flips (SD-16/SD-17, SSI-09). Manual
 * accounts retain the recurrence requirements. Synced series only change
 * their designation intent and never request recurrence confirmation.
 */
export function resolveSubscriptionSwitch(
  state: SubscriptionDesignationState,
  switchedOn: boolean,
  isSyncedAccount = false
): SubscriptionSwitchResolution {
  if (!switchedOn || isSyncedAccount) {
    return {
      ...state,
      isSubscription: switchedOn,
      needsRecurrenceModal: false,
    };
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
 * State after the "Recorrente" switch flips (SD-18, SSI-09). Only manual
 * subscriptions lose their designation when recurrence is turned off.
 */
export function resolveRecurringSwitch(
  state: SubscriptionDesignationState,
  switchedOn: boolean,
  isSyncedAccount = false
): SubscriptionDesignationState {
  if (switchedOn) {
    return { ...state, isRecurring: true };
  }
  return {
    ...state,
    isRecurring: false,
    isSubscription: isSyncedAccount && state.isSubscription,
  };
}

/**
 * State after RecurrenceSelect saves (SD-19, SSI-09). DAILY/WEEKLY only
 * un-designates manual subscriptions; synced series remain independent.
 */
export function resolveRecurrenceSaved(
  state: SubscriptionDesignationState,
  saved: { period: RecurrencePeriodValue },
  isSyncedAccount = false
): SubscriptionDesignationState {
  return {
    ...state,
    recurrencePeriod: saved.period,
    isSubscription:
      state.isSubscription &&
      (isSyncedAccount || isSubscriptionRecurrencePeriod(saved.period)),
  };
}

/** Synced rows trust is_recurring; manual rows retain legacy designation inference. */
export function resolveRecurrenceHydration(
  state: Pick<SubscriptionDesignationState, 'isRecurring' | 'isSubscription'>,
  isSyncedAccount = false
): boolean {
  return state.isRecurring || (!isSyncedAccount && state.isSubscription);
}

/**
 * Transactions offered when designating a subscription from existing ones
 * (SD-06): credit/debit only (transfers are internal movements, never
 * subscriptions) and not already designated. Hidden-account rows are never
 * offered (HIDE-02).
 */
export function selectSubscriptionCandidates(
  transactions: TransactionProps[]
): TransactionProps[] {
  return transactions.filter(
    (transaction) =>
      (transaction.type === 'CREDIT' || transaction.type === 'DEBIT') &&
      !transaction.is_subscription &&
      !isHiddenAccountTransaction(transaction)
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
