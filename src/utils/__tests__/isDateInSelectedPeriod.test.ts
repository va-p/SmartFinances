import { isDateInSelectedPeriod } from '../isDateInSelectedPeriod';

const selectedDate = new Date(2026, 7, 15); // Saturday - ISO week 33 of 2026 (Mon Aug 10 - Sun Aug 16)

describe('isDateInSelectedPeriod', () => {
  // WEEK-02 — weeks include the whole ISO week (Monday 00:00 through Sunday 23:59)
  it('includes the Monday and the Sunday of the selected ISO week', () => {
    expect(
      isDateInSelectedPeriod(new Date(2026, 7, 10, 0, 0, 0), selectedDate, 'weeks')
    ).toBe(true);
    expect(
      isDateInSelectedPeriod(new Date(2026, 7, 16, 23, 59, 59), selectedDate, 'weeks')
    ).toBe(true);
  });

  it('excludes the adjacent Monday and the previous Sunday', () => {
    expect(
      isDateInSelectedPeriod(new Date(2026, 7, 17), selectedDate, 'weeks')
    ).toBe(false);
    expect(
      isDateInSelectedPeriod(new Date(2026, 7, 9), selectedDate, 'weeks')
    ).toBe(false);
  });

  // Spec edge case — ISO week-year differs from calendar year (2025-12-29 is ISO week 1 of 2026)
  it('uses the ISO week-year at year boundaries', () => {
    const boundarySelectedDate = new Date(2025, 11, 29); // Monday - ISO week 1 of 2026
    expect(
      isDateInSelectedPeriod(new Date(2026, 0, 4), boundarySelectedDate, 'weeks')
    ).toBe(true); // Sunday of ISO week 1 of 2026
    expect(
      isDateInSelectedPeriod(new Date(2025, 11, 28), boundarySelectedDate, 'weeks')
    ).toBe(false); // ISO week 52 of 2025
  });

  // WEEK-09 — months/years/all semantics preserved (mirror of the previous processTransactions predicate)
  it('matches the month and year of the selected date in months mode', () => {
    expect(
      isDateInSelectedPeriod(new Date(2026, 7, 1), selectedDate, 'months')
    ).toBe(true);
    expect(
      isDateInSelectedPeriod(new Date(2026, 6, 31), selectedDate, 'months')
    ).toBe(false);
    expect(
      isDateInSelectedPeriod(new Date(2025, 7, 15), selectedDate, 'months')
    ).toBe(false);
  });

  it('matches only the year of the selected date in years mode', () => {
    expect(
      isDateInSelectedPeriod(new Date(2026, 0, 1), selectedDate, 'years')
    ).toBe(true);
    expect(
      isDateInSelectedPeriod(new Date(2025, 11, 31), selectedDate, 'years')
    ).toBe(false);
  });

  it('always returns true in all mode', () => {
    expect(isDateInSelectedPeriod(new Date(2020, 0, 1), selectedDate, 'all')).toBe(
      true
    );
  });
});
