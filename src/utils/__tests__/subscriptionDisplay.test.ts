import {
  subscriptionFrequencyText,
  subscriptionRecurrenceLabel,
} from '../subscriptionDisplay';

// Spec-anchored tests (spec.md R9 / AC9.2).

describe('subscriptionRecurrenceLabel', () => {
  it('maps MONTHLY to Mensal and YEARLY to Anual', () => {
    expect(subscriptionRecurrenceLabel('MONTHLY')).toBe('Mensal');
    expect(subscriptionRecurrenceLabel('YEARLY')).toBe('Anual');
  });

  it('returns an empty string for null/undefined/other periods', () => {
    expect(subscriptionRecurrenceLabel(null)).toBe('');
    expect(subscriptionRecurrenceLabel(undefined)).toBe('');
  });
});

describe('subscriptionFrequencyText', () => {
  // AC9.2 — "Mensal · Dia 6"
  it('builds "Mensal · Dia 6" from period and day', () => {
    expect(
      subscriptionFrequencyText({ recurrence_period: 'MONTHLY', day: 6 })
    ).toBe('Mensal · Dia 6');
  });

  it('builds "Anual · Dia 15" for yearly subscriptions', () => {
    expect(
      subscriptionFrequencyText({ recurrence_period: 'YEARLY', day: 15 })
    ).toBe('Anual · Dia 15');
  });

  it('returns empty when the recurrence period is missing', () => {
    expect(
      subscriptionFrequencyText({ recurrence_period: null, day: 6 })
    ).toBe('');
  });
});
