import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

const fetchTransactionDetail = async (transactionID: string) => {
  const { data } = await api.get('transaction/single', {
    params: { transaction_id: transactionID },
  });
  return data;
};

export function useTransactionDetailQuery(transactionID: string) {
  return useQuery({
    queryKey: ['transaction', transactionID],
    queryFn: () => fetchTransactionDetail(transactionID),
    enabled: !!transactionID,
  });
}
