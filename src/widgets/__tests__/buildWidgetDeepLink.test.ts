import { buildWidgetDeepLink } from '../buildWidgetDeepLink';

describe('buildWidgetDeepLink', () => {
  // WDG-15 — + opens the add-transaction flow via Home auto-open param
  // (contract changed in T20: the dedicated route redirected to Home).
  it('builds the add-transaction URL', () => {
    expect(buildWidgetDeepLink({ type: 'addTransaction' })).toBe(
      'com.vap.smartfinances://?addTransaction=true'
    );
  });

  // WDG-28 — Relatórios opens Overview
  it('builds the overview URL', () => {
    expect(buildWidgetDeepLink({ type: 'overview' })).toBe(
      'com.vap.smartfinances://overview'
    );
  });

  // Budget row opens its detail
  it('builds the budget detail URL with the budget id', () => {
    expect(buildWidgetDeepLink({ type: 'budget', id: 'abc-123' })).toBe(
      'com.vap.smartfinances://budgets/abc-123'
    );
  });

  // Headers open their section homes
  it('builds section home URLs', () => {
    expect(buildWidgetDeepLink({ type: 'budgets' })).toBe(
      'com.vap.smartfinances://budgets'
    );
    expect(buildWidgetDeepLink({ type: 'accounts' })).toBe(
      'com.vap.smartfinances://accounts'
    );
  });

  // Unknown targets fall back to app home (never a dead tap)
  it('falls back to app home for unknown targets', () => {
    expect(buildWidgetDeepLink({ type: 'unknown-target' })).toBe(
      'com.vap.smartfinances://'
    );
  });
});
