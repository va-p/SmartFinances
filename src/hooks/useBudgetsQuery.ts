import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { BudgetProps } from '@interfaces/budget';

const fetchBudgets = async (userID: string): Promise<BudgetProps[]> => {
  const { data } = await api.get('budget', {
    params: {
      user_id: userID,
    },
  });
  return data;
};

export function useBudgetsQuery(userID: string | undefined) {
  return useQuery({
    queryKey: ['budgets', userID],
    queryFn: () => fetchBudgets(userID!),
    enabled: !!userID,
  });
}
