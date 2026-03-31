import { useMemo } from 'react';
import { formatBudgetInfo } from '@utils/budgetCalculations';

import { useBudgetsQuery } from './useBudgetsQuery';
import { useTransactionsQuery } from './useTransactionsQuery';
import { useBudgetDetailQuery } from './useBudgetDetailQuery';

import { FormattedBudgetProps } from '@interfaces/budget';

export function useFormattedBudgets() {
  const {
    data: rawBudgets,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
  } = useBudgetsQuery();
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useTransactionsQuery();

  const formattedBudgets: FormattedBudgetProps[] = useMemo(() => {
    if (!rawBudgets || !transactions) return [];

    return rawBudgets.map((budget) => formatBudgetInfo(budget, transactions));
  }, [rawBudgets, transactions]);

  return {
    budgets: formattedBudgets,
    isLoading: isLoadingBudgets || isLoadingTransactions,
    refetchBudgets,
    refetchTransactions,
  };
}

export function useFormattedBudgetDetail(budgetID: string) {
  const {
    data: rawBudget,
    isLoading: isLoadingBudget,
    isError,
  } = useBudgetDetailQuery(budgetID);
  const { data: transactions, isLoading: isLoadingTransactions } =
    useTransactionsQuery();

  const formattedBudget: FormattedBudgetProps | null = useMemo(() => {
    if (!rawBudget || !transactions) return null;

    return formatBudgetInfo(rawBudget, transactions);
  }, [rawBudget, transactions]);

  return {
    budget: formattedBudget,
    isLoading: isLoadingBudget || isLoadingTransactions,
    isError,
  };
}
