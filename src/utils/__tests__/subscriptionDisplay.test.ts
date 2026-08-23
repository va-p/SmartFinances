import {
  formatShortDayMonth,
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

describe('formatShortDayMonth', () => {
  // Payment rows: "6 AGO."
  it('formats a Date as "d MMM."', () => {
    expect(formatShortDayMonth(new Date(2026, 7, 6))).toBe('6 AGO.');
  });

  it('formats an ISO string as "d MMM."', () => {
    expect(formatShortDayMonth('2026-06-15T12:00:00.000Z')).toMatch(
      /^15 JUN\.$/
    );
  });

  it('does not zero-pad the day', () => {
    expect(formatShortDayMonth(new Date(2026, 0, 5))).toBe('5 JAN.');
  });
});
