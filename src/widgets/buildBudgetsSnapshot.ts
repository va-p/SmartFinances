import formatCurrency from '@utils/formatCurrency';

import { FormattedBudgetProps } from '@interfaces/budget';

import { WidgetBudgetRow } from './widgetSnapshotTypes';

// Widget budget rows are ordered by highest spend percentage first (user
// decision 2026-11-10). Native widgets slice the first 3 (Medium) or 6
// (Large); the builder returns the full ordered list.
export function buildBudgetsSnapshot(
  budgets: FormattedBudgetProps[]
): WidgetBudgetRow[] {
  return [...budgets]
    .sort((a, b) => b.percentage - a.percentage)
    .map((budget) => {
      const remaining = Number(budget.amount) - Number(budget.amount_spent);
      const over = remaining < 0;

      return {
        id: budget.id,
        name: budget.name,
        percent: budget.percentage,
        percentLabel: `${budget.percentage.toFixed(1).replace('.', ',')}%`,
        statusText: over
          ? `Estourado! ${formatCurrency(budget.currency.code, remaining)}`
          : `${formatCurrency(budget.currency.code, remaining)} restantes`,
        over,
      };
    });
}
