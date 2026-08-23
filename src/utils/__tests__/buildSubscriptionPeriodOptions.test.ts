import { buildSubscriptionPeriodOptions, monthLabel } from '../buildSubscriptionPeriodOptions';

// Spec-anchored tests (spec.md R9 / AC9.1-9.2).

const today = new Date(2026, 7, 15); // August 2026 (local)

describe('buildSubscriptionPeriodOptions', () => {
  // AC9.1 — 25 months, ascending, last 12 → next 12
  it('returns 25 options covering last 12 to next 12 months, ascending', () => {
    const options = buildSubscriptionPeriodOptions(undefined, today);

    expect(options).toHaveLength(25);
    expect(options[0].key).toBe('2025-08');
    expect(options[12].key).toBe('2026-08');
    expect(options[24].key).toBe('2027-08');

    const keys = options.map((option) => option.key);
    expect(keys).toEqual([...keys].sort());
  });

  // AC9.1 — current month active when no selection
  it('marks the current month active when no selection is given', () => {
    const options = buildSubscriptionPeriodOptions(undefined, today);

    const active = options.filter((option) => option.isActive);
    expect(active).toHaveLength(1);
    expect(active[0].key).toBe('2026-08');
  });

  // AC9.1 — explicit selection wins
  it('marks the explicitly selected month active', () => {
    const options = buildSubscriptionPeriodOptions('2026-07', today);

    const active = options.filter((option) => option.isActive);
    expect(active).toHaveLength(1);
    expect(active[0].key).toBe('2026-07');
  });

  // AC9.2 — label format
  it('labels every option as "Agosto 2026" style', () => {
    const options = buildSubscriptionPeriodOptions(undefined, today);

    expect(options[12].label).toBe('Agosto 2026');
    expect(monthLabel('2026-01')).toBe('Janeiro 2026');
    expect(monthLabel('2026-12')).toBe('Dezembro 2026');
  });
});
