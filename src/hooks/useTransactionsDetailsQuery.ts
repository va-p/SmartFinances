
import { useQuery } from '@tanstack/react-query';
import api from '@api/api';
import { TransactionProps } from '@interfaces/transactions';

async function fetchTransactionDetails(id: string): Promise<TransactionProps> {
  const { data } = await api.get(`transaction/show/${id}`);
  return data;
}

export function useTransactionsDetailsQuery(transactionIds: string[]) {
  return useQuery({
    queryKey: ['transactionsDetails', transactionIds],
    queryFn: () => Promise.all(transactionIds.map(fetchTransactionDetails)),
    enabled: transactionIds.length > 0,
  });
}
