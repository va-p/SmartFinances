import { useMemo } from 'react';

import {
  FlashListTransactionItem,
  flattenTransactionsForFlashList,
} from '@utils/flattenTransactionsForFlashList';

import { TransactionProps } from '@interfaces/transactions';

type UseTransactionFilteringProps = {
  searchQuery: string;
  transactionsGrouped: Array<{
    title: string;
    total: string;
    data: TransactionProps[];
  }>;
};

type UseTransactionFilteringReturn = {
  filteredTransactions: FlashListTransactionItem[];
};

export function useTransactionFiltering({
  searchQuery,
  transactionsGrouped,
}: UseTransactionFilteringProps): UseTransactionFilteringReturn {
  const flattenedTransactions = useMemo(
    () => flattenTransactionsForFlashList(transactionsGrouped),
    [transactionsGrouped]
  );

  const filteredTransactions = useMemo(() => {
    if (!searchQuery || searchQuery.length === 0) {
      return flattenedTransactions;
    }

    const filteredGroups = transactionsGrouped
      .map((group) => ({
        ...group,
        data: group.data.filter((transaction: TransactionProps) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.data.length > 0);

    return flattenTransactionsForFlashList(filteredGroups);
  }, [searchQuery, flattenedTransactions, transactionsGrouped]);

  return {
    filteredTransactions,
  };
}
