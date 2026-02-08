import { useQuery } from '@tanstack/react-query';

import api from '@api/api';
import { TransactionProps } from '@interfaces/transactions';

const fetchBulkTransactions = async (transactionIds: number[]) => {
  if (transactionIds.length === 0) {
    return [];
  }

  // Fetch all transactions in parallel
  const promises = transactionIds.map((id) =>
    api.get('transaction/single', {
      params: { transaction_id: id },
    })
  );

  const results = await Promise.all(promises);
  return results.map((result) => result.data) as TransactionProps[];
};

export function useBulkTransactionsQuery(transactionIds: number[]) {
  return useQuery({
    queryKey: ['bulk-transactions', transactionIds],
    queryFn: () => fetchBulkTransactions(transactionIds),
    enabled: transactionIds.length > 0,
  });
}
