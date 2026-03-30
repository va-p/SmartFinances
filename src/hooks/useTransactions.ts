import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { TransactionProps } from '@interfaces/transactions';

async function getTransactions(): Promise<TransactionProps[]> {
  const { data } = await api.get('transaction');
  return data;
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],

    queryFn: getTransactions,
  });
}
