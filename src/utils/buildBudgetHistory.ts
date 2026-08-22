import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { BudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

import {
  BudgetPeriod,
  getBudgetPeriods,
  getTransactionSpentAmount,
} from './budgetCalculations';

export interface BudgetHistoryPeriod extends BudgetPeriod {
  amountSpent: number;
}

export function buildBudgetHistory(
  budget: BudgetProps,
  transactions: TransactionProps[],
  upTo: Date = new Date()
): BudgetHistoryPeriod[] {
  const periods = getBudgetPeriods(budget, upTo);
  const categoryIds = new Set(
    budget.categories.map((category: any) => category.category_id)
  );

  const budgetTransactions = transactions.filter((transaction) =>
    categoryIds.has(transaction.category.id)
  );

  return periods.map((period) => {
    let amountSpent = 0;

    for (const transaction of budgetTransactions) {
      const transactionDate = new Date(transaction.created_at);

      if (
        transactionDate >= period.startDate &&
        transactionDate <= period.endDate
      ) {
        amountSpent += getTransactionSpentAmount(transaction);
      }
    }

    return {
      startDate: period.startDate,
      endDate: period.endDate,
      amountSpent,
    };
  });
}

export function formatBudgetHistoryLabel(date: Date): string {
  return format(date, 'MMM yy', { locale: ptBR })
    .replace('.', '')
    .toUpperCase();
}

export function getAverageBudgetSpending(
  history: BudgetHistoryPeriod[]
): number {
  if (history.length === 0) {
    return 0;
  }

  const total = history.reduce(
    (sum, period) => sum + period.amountSpent,
    0
  );

  return total / history.length;
}
