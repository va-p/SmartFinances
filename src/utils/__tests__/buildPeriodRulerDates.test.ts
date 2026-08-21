import { buildPeriodRulerDates } from '../buildPeriodRulerDates';

const selectedDate = new Date(2026, 7, 15); // August 2026 (local)

describe('buildPeriodRulerDates', () => {
  // AC-001.1 — 12 months of the selected year, newest-first, selected month active
  it('returns the 12 months of the selected year, newest-first, with only the selected month active', () => {
    const dates = buildPeriodRulerDates({
      period: 'months',
      selectedDate,
      years: [],
    });

    expect(dates).toHaveLength(12);
    expect(dates[0].date).toBe('Dez \n 2026');
    expect(dates[11].date).toBe('Jan \n 2026');

    const active = dates.filter((date) => date.isActive);
    expect(active).toHaveLength(1);
    expect(active[0].date).toBe('Ago \n 2026');
  });

  it('renders the 12 months for period "all" like for "months"', () => {
    const dates = buildPeriodRulerDates({
      period: 'all',
      selectedDate,
      years: [],
    });

    expect(dates).toHaveLength(12);
    expect(dates[0].date).toBe('Dez \n 2026');
  });

  // AC-001.2 — years from the context source plus selected year, newest-first
  it('returns the source years plus the selected year, newest-first, with the selected year active', () => {
    const dates = buildPeriodRulerDates({
      period: 'years',
      selectedDate,
      years: [2024, 2026],
    });

    expect(dates.map((date) => date.date)).toEqual(['2026', '2024']);
    expect(dates[0].isActive).toBe(true);
    expect(dates[1].isActive).toBe(false);
  });

  it('includes the selected year even when absent from the source years', () => {
    const dates = buildPeriodRulerDates({
      period: 'years',
      selectedDate: new Date(2025, 0, 1),
      years: [2024],
    });

    expect(dates.map((date) => date.date)).toEqual(['2025', '2024']);
    expect(dates[0].isActive).toBe(true);
  });

  it('falls back to the selected year only when the source has no years', () => {
    const dates = buildPeriodRulerDates({
      period: 'years',
      selectedDate,
      years: [],
    });

    expect(dates.map((date) => date.date)).toEqual(['2026']);
    expect(dates[0].isActive).toBe(true);
  });
});
