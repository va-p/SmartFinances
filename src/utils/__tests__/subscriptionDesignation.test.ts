import { TransactionProps } from '@interfaces/transactions';

import {
  SubscriptionDesignationState,
  buildSubscriptionDesignationPayload,
  isSubscriptionRecurrencePeriod,
  resolveRecurringSwitch,
  resolveRecurrenceSaved,
  resolveSubscriptionSwitch,
  selectSubscriptionCandidates,
} from '../subscriptionDesignation';

// Spec-anchored tests (spec.md SD-06, SD-16..SD-19, SD-22..SD-24). Assert the
// spec-defined outcomes, not the implementation.

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 1,
  created_at: '2026-10-01T12:00:00.000Z',
  description: 'Netflix',
  amount: -55.9,
  amount_formatted: 'R$ -55,90',
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  type: 'DEBIT',
  account: {
    id: 1,
    name: 'Conta',
    currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
    type: 'BANK',
    balance: 0,
    initialAmount: 0,
  },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    color: { color_code: '#FFAA29' },
  },
  tags: [],
  user_id: 'user-1',
  ...overrides,
});

const state = (
  overrides: Partial<SubscriptionDesignationState> = {}
): SubscriptionDesignationState => ({
  isSubscription: false,
  isRecurring: false,
  recurrencePeriod: 'DAILY',
  ...overrides,
});

describe('isSubscriptionRecurrencePeriod', () => {
  it('accepts only MONTHLY and YEARLY', () => {
    expect(isSubscriptionRecurrencePeriod('MONTHLY')).toBe(true);
    expect(isSubscriptionRecurrencePeriod('YEARLY')).toBe(true);
    expect(isSubscriptionRecurrencePeriod('DAILY')).toBe(false);
    expect(isSubscriptionRecurrencePeriod('WEEKLY')).toBe(false);
    expect(isSubscriptionRecurrencePeriod(null)).toBe(false);
    expect(isSubscriptionRecurrencePeriod(undefined)).toBe(false);
  });
});

describe('selectSubscriptionCandidates (SD-06)', () => {
  it('keeps only credit/debit transactions not yet designated', () => {
    const debit = makeTransaction({ id: 1, type: 'DEBIT' });
    const credit = makeTransaction({ id: 2, type: 'CREDIT' });
    const transferOut = makeTransaction({ id: 3, type: 'TRANSFER_DEBIT' });
    const transferIn = makeTransaction({ id: 4, type: 'TRANSFER_CREDIT' });
    const alreadySubscription = makeTransaction({ id: 5, is_subscription: true });
    const hiddenSubscription = makeTransaction({
      id: 6,
      is_subscription: true,
      hide_from_subscription_list: true,
    });

    const candidates = selectSubscriptionCandidates([
      alreadySubscription,
      debit,
      transferOut,
      credit,
      hiddenSubscription,
      transferIn,
    ]);

    // Order preserved; transfers and already-designated (hidden or not) out
    expect(candidates).toEqual([debit, credit]);
  });

  it('returns an empty list when nothing qualifies', () => {
    expect(selectSubscriptionCandidates([])).toEqual([]);
    expect(
      selectSubscriptionCandidates([
        makeTransaction({ type: 'TRANSFER_DEBIT' }),
        makeTransaction({ type: 'CREDIT', is_subscription: true }),
      ])
    ).toEqual([]);
  });
});

describe('resolveSubscriptionSwitch (SD-16/SD-17)', () => {
  it('turning on without recurrence designates, recurs monthly and opens the modal', () => {
    const next = resolveSubscriptionSwitch(state(), true);

    expect(next.isSubscription).toBe(true);
    expect(next.isRecurring).toBe(true);
    expect(next.recurrencePeriod).toBe('MONTHLY');
    expect(next.needsRecurrenceModal).toBe(true);
  });

  it('turning on normalizes DAILY and WEEKLY periods to MONTHLY and opens the modal', () => {
    const fromDaily = resolveSubscriptionSwitch(
      state({ isRecurring: true, recurrencePeriod: 'DAILY' }),
      true
    );
    const fromWeekly = resolveSubscriptionSwitch(
      state({ isRecurring: true, recurrencePeriod: 'WEEKLY' }),
      true
    );

    expect(fromDaily.recurrencePeriod).toBe('MONTHLY');
    expect(fromDaily.needsRecurrenceModal).toBe(true);
    expect(fromWeekly.recurrencePeriod).toBe('MONTHLY');
    expect(fromWeekly.needsRecurrenceModal).toBe(true);
  });

  it('turning on with MONTHLY recurrence keeps the period and skips the modal', () => {
    const next = resolveSubscriptionSwitch(
      state({ isRecurring: true, recurrencePeriod: 'MONTHLY' }),
      true
    );

    expect(next.recurrencePeriod).toBe('MONTHLY');
    expect(next.needsRecurrenceModal).toBe(false);
  });

  it('turning on with YEARLY recurrence keeps the period and skips the modal', () => {
    const next = resolveSubscriptionSwitch(
      state({ isRecurring: true, recurrencePeriod: 'YEARLY' }),
      true
    );

    expect(next.recurrencePeriod).toBe('YEARLY');
    expect(next.needsRecurrenceModal).toBe(false);
  });

  it('turning off un-designates and changes nothing else', () => {
    const next = resolveSubscriptionSwitch(
      state({ isSubscription: true, isRecurring: true, recurrencePeriod: 'MONTHLY' }),
      false
    );

    expect(next.isSubscription).toBe(false);
    expect(next.isRecurring).toBe(true);
    expect(next.recurrencePeriod).toBe('MONTHLY');
    expect(next.needsRecurrenceModal).toBe(false);
  });
});

describe('resolveRecurringSwitch (SD-18)', () => {
  it('turning recurrence off also un-designates', () => {
    const next = resolveRecurringSwitch(
      state({ isSubscription: true, isRecurring: true, recurrencePeriod: 'MONTHLY' }),
      false
    );

    expect(next.isRecurring).toBe(false);
    expect(next.isSubscription).toBe(false);
  });

  it('turning recurrence on keeps the designation state untouched', () => {
    const next = resolveRecurringSwitch(state(), true);

    expect(next.isRecurring).toBe(true);
    expect(next.isSubscription).toBe(false);
    expect(next.recurrencePeriod).toBe('DAILY');
  });
});

describe('resolveRecurrenceSaved (SD-19)', () => {
  it('MONTHLY and YEARLY saves keep the designation', () => {
    const monthly = resolveRecurrenceSaved(
      state({ isSubscription: true, isRecurring: true, recurrencePeriod: 'DAILY' }),
      { period: 'MONTHLY' }
    );
    const yearly = resolveRecurrenceSaved(monthly, { period: 'YEARLY' });

    expect(monthly.isSubscription).toBe(true);
    expect(monthly.recurrencePeriod).toBe('MONTHLY');
    expect(yearly.isSubscription).toBe(true);
    expect(yearly.recurrencePeriod).toBe('YEARLY');
  });

  it('a DAILY or WEEKLY save un-designates a designated transaction', () => {
    const designated = state({
      isSubscription: true,
      isRecurring: true,
      recurrencePeriod: 'MONTHLY',
    });
    const daily = resolveRecurrenceSaved(designated, { period: 'DAILY' });
    const weekly = resolveRecurrenceSaved(designated, { period: 'WEEKLY' });

    expect(daily.isSubscription).toBe(false);
    expect(daily.recurrencePeriod).toBe('DAILY');
    expect(weekly.isSubscription).toBe(false);
    expect(weekly.recurrencePeriod).toBe('WEEKLY');
  });

  it('a DAILY save on an undesignated transaction stays undesignated', () => {
    const next = resolveRecurrenceSaved(state({ isRecurring: true }), {
      period: 'DAILY',
    });

    expect(next.isSubscription).toBe(false);
  });
});

describe('buildSubscriptionDesignationPayload (SD-22/SD-23/SD-24)', () => {
  it('sends is_subscription true on create when designated', () => {
    expect(buildSubscriptionDesignationPayload(true, 'create')).toEqual({
      is_subscription: true,
    });
  });

  it('omits is_subscription on create when undesignated (auto-classification stands)', () => {
    const payload = buildSubscriptionDesignationPayload(false, 'create');

    expect(payload).toEqual({});
    expect('is_subscription' in payload).toBe(false);
  });

  it('sends is_subscription true on edit when designated', () => {
    expect(buildSubscriptionDesignationPayload(true, 'edit')).toEqual({
      is_subscription: true,
    });
  });

  it('sends is_subscription false on edit when undesignated (un-designates)', () => {
    expect(buildSubscriptionDesignationPayload(false, 'edit')).toEqual({
      is_subscription: false,
    });
  });
});
