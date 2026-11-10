import { FormattedBudgetProps } from '@interfaces/budget';

import { buildBudgetsSnapshot } from '../buildBudgetsSnapshot';

function makeBudget(overrides: Partial<FormattedBudgetProps> = {}) {
  return {
    id: 'b1',
    name: 'Lazer',
    amount: 1000,
    amount_spent: 308,
    percentage: 30.8,
    currency: { code: 'BRL' },
    categories: [],
    start_date: '2026-11-01',
    recurrence: 'monthly',
    user_id: 'u1',
    transactions: [],
    ...overrides,
  } as unknown as FormattedBudgetProps;
}

describe('buildBudgetsSnapshot', () => {
  // WDG-05/WDG-06 — widget order is highest spend % first (user decision 2026-11-10)
  it('sorts budgets by spend percentage descending', () => {
    const rows = buildBudgetsSnapshot([
      makeBudget({ id: 'low', name: 'Lazer', percentage: 30.8 }),
      makeBudget({ id: 'high', name: 'Moradia', percentage: 102.4 }),
      makeBudget({ id: 'mid', name: 'Alimentação', percentage: 31.5 }),
    ]);

    expect(rows.map((r) => r.id)).toEqual(['high', 'mid', 'low']);
  });

  // WDG-02 — in-limit row: green bar path, "R$ X restantes"
  it('renders an in-limit row with remaining text', () => {
    const [row] = buildBudgetsSnapshot([
      makeBudget({ percentage: 30.8, amount: 1000, amount_spent: 308 }),
    ]);

    expect(row.over).toBe(false);
    expect(row.percentLabel).toBe('30,8%');
    expect(row.statusText).toBe('R$\u00A0692,00 restantes');
  });

  // WDG-03 — over-limit row: coral path, "Estourado! -R$ Y"
  it('renders an over-limit row with overrun text', () => {
    const [row] = buildBudgetsSnapshot([
      makeBudget({ percentage: 102.4, amount: 1000, amount_spent: 1024 }),
    ]);

    expect(row.over).toBe(true);
    expect(row.percentLabel).toBe('102,4%');
    expect(row.statusText).toBe('Estourado! -R$\u00A024,00');
  });

  // WDG-08 — empty state payload
  it('returns an empty array when no budgets exist', () => {
    expect(buildBudgetsSnapshot([])).toEqual([]);
  });

  it('preserves budget id and name', () => {
    const [row] = buildBudgetsSnapshot([
      makeBudget({ id: 'abc', name: 'Moradia e Contas' }),
    ]);

    expect(row.id).toBe('abc');
    expect(row.name).toBe('Moradia e Contas');
  });
});
