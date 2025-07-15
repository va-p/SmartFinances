import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { BudgetProps } from '@interfaces/budget';

const fetchBudgetDetail = async (budgetID: string): Promise<BudgetProps> => {
  const { data } = await api.get('budget/single', {
    params: { budget_id: budgetID },
  });
  return data;
};

export function useBudgetDetailQuery(budgetID: string) {
  return useQuery({
    queryKey: ['budget', budgetID],
    queryFn: () => fetchBudgetDetail(budgetID),
    enabled: !!budgetID,
  });
}
