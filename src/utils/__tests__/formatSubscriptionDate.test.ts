import { formatSubscriptionDate } from '../formatSubscriptionDate';

// Spec-anchored tests (spec.md R8 / AC8.2): assert the exact spec-defined
// display string, not implementation internals.

describe('formatSubscriptionDate', () => {
  // AC8.2 — "06 AGO. 2026"
  it('formats a Date as "dd MMM. yyyy" with uppercase PT-BR month', () => {
    expect(formatSubscriptionDate(new Date(2026, 7, 6))).toBe('06 AGO. 2026');
  });

  it('formats an ISO string as "dd MMM. yyyy"', () => {
    expect(formatSubscriptionDate('2026-07-06T12:00:00.000Z')).toMatch(
      /^06 JUL\. 2026$/
    );
  });

  it('zero-pads single-digit days', () => {
    expect(formatSubscriptionDate(new Date(2026, 0, 5))).toBe('05 JAN. 2026');
  });

  it('renders all PT-BR month abbreviations', () => {
    const expected = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ];
    expected.forEach((abbr, index) => {
      expect(formatSubscriptionDate(new Date(2026, index, 15))).toBe(
        `15 ${abbr}. 2026`
      );
    });
  });
});
