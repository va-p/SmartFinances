import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { TransactionProps } from '@interfaces/transactions';

async function getTransactions({ queryKey }: any): Promise<TransactionProps[]> {
  const [_key, userID] = queryKey;

  if (!userID) {
    return [];
  }

  const { data } = await api.get('transaction', {
    params: {
      user_id: userID,
    },
  });
  return data;
}

export function useTransactionsQuery(userID: string | undefined) {
  return useQuery({
    queryKey: ['transactions', userID],
    queryFn: getTransactions,
    enabled: !!userID,
  });
}
