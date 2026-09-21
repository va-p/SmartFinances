import {
  buildCreditCardDataPayload,
  buildStatementCloseDate,
  getClosingDayFromDate,
} from '@utils/creditCardData';

/**
 * Spec-anchored tests for the credit card payload builders
 * (spec.md CC-07..CC-09 + Edge Cases, feature register-credit-card-fields).
 */

describe('buildStatementCloseDate (CC-09 / edge cases)', () => {
  it('CC-09: rolls to next month when this month occurrence already passed', () => {
    const now = new Date('2026-09-14T15:30:00.000Z');
    const result = buildStatementCloseDate(8, now);
    expect(result.toISOString()).toBe('2026-10-08T00:00:00.000Z');
  });

  it('CC-09: keeps the current month when the day is still ahead', () => {
    const now = new Date('2026-09-14T15:30:00.000Z');
    const result = buildStatementCloseDate(28, now);
    expect(result.toISOString()).toBe('2026-09-28T00:00:00.000Z');
  });

  it('edge: same-day closing is kept (today is still the closing date)', () => {
    const now = new Date('2026-09-08T23:59:59.000Z');
    const result = buildStatementCloseDate(8, now);
    expect(result.toISOString()).toBe('2026-09-08T00:00:00.000Z');
  });

  it('edge: day 31 stays in a 31-day month when ahead', () => {
    const now = new Date('2026-01-15T00:00:00.000Z');
    const result = buildStatementCloseDate(31, now);
    expect(result.toISOString()).toBe('2026-01-31T00:00:00.000Z');
  });

  it('edge: day 30 skips short February (never month-overflow)', () => {
    const now = new Date('2026-01-31T23:59:59.000Z');
    const result = buildStatementCloseDate(30, now);
    expect(result.toISOString()).toBe('2026-03-30T00:00:00.000Z');
  });

  it('edge: day 29 in a non-leap February rolls to March', () => {
    const now = new Date('2026-02-10T00:00:00.000Z');
    const result = buildStatementCloseDate(29, now);
    expect(result.toISOString()).toBe('2026-03-29T00:00:00.000Z');
  });
});

describe('getClosingDayFromDate (CC-06 edit pre-fill extraction)', () => {
  it('extracts the day of month from an API ISO string', () => {
    expect(getClosingDayFromDate('2026-10-08T00:00:00.000Z')).toBe(8);
  });

  it('extracts the UTC day from a Date instance', () => {
    expect(getClosingDayFromDate(new Date('2026-03-01T00:00:00.000Z'))).toBe(
      1
    );
  });

  it('returns null for absent or invalid values so the input stays empty', () => {
    expect(getClosingDayFromDate(null)).toBeNull();
    expect(getClosingDayFromDate(undefined)).toBeNull();
    expect(getClosingDayFromDate('')).toBeNull();
    expect(getClosingDayFromDate('not-a-date')).toBeNull();
  });
});

describe('buildCreditCardDataPayload (CC-07 / CC-08)', () => {
  it('CC-07: maps all four manual fields with the entered closing day', () => {
    const now = new Date('2026-09-14T15:30:00.000Z');
    const payload = buildCreditCardDataPayload(
      {
        brand: '  Visa  ',
        closeDay: 8,
        creditLimit: '5000',
        availableCreditLimit: 700,
      },
      now
    );

    expect(payload).toEqual({
      brand: 'Visa',
      balanceCloseDate: '2026-10-08T00:00:00.000Z',
      creditLimit: 5000,
      availableCreditLimit: 700,
    });
  });

  it('CC-07: balanceCloseDate is a full ISO-8601 UTC datetime (backend zod contract)', () => {
    const payload = buildCreditCardDataPayload(
      { brand: 'Visa', closeDay: 8, creditLimit: 5000 },
      new Date('2026-09-14T00:00:00.000Z')
    );

    expect(payload!.balanceCloseDate).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
    expect(payload!.balanceCloseDate).toBe('2026-10-08T00:00:00.000Z');
  });

  it('CC-07: optional available limit is null when empty (persisted as null)', () => {
    const payload = buildCreditCardDataPayload(
      { brand: 'Visa', closeDay: 8, creditLimit: 5000, availableCreditLimit: '' },
      new Date('2026-09-14T00:00:00.000Z')
    );

    expect(payload!.availableCreditLimit).toBeNull();
  });

  it('CC-07: available limit defaults to null when not provided at all', () => {
    const payload = buildCreditCardDataPayload(
      { brand: 'Elo', closeDay: 15, creditLimit: 2000 },
      new Date('2026-09-14T00:00:00.000Z')
    );

    expect(payload!.availableCreditLimit).toBeNull();
  });

  it('CC-08: returns null (omit creditData) when required values are missing', () => {
    const now = new Date('2026-09-14T00:00:00.000Z');

    expect(buildCreditCardDataPayload({}, now)).toBeNull();
    expect(
      buildCreditCardDataPayload({ brand: 'Visa' }, now)
    ).toBeNull();
    expect(
      buildCreditCardDataPayload({ brand: 'Visa', closeDay: 8 }, now)
    ).toBeNull();
    expect(
      buildCreditCardDataPayload({ closeDay: 8, creditLimit: 5000 }, now)
    ).toBeNull();
    expect(
      buildCreditCardDataPayload({ brand: '   ', closeDay: 8, creditLimit: 5000 }, now)
    ).toBeNull();
  });
});
