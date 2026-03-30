import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { BudgetProps } from '@interfaces/budget';

const fetchBudgets = async (): Promise<BudgetProps[]> => {
  const { data } = await api.get('budget');
  return data;
};

export function useBudgetsQuery() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => fetchBudgets(),
  });
}
