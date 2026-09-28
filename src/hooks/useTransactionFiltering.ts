import { useMemo } from 'react';

import {
  FlashListTransactionItem,
  flattenTransactionsForFlashList,
} from '@utils/flattenTransactionsForFlashList';
import { filterSectionsByQuery } from '@utils/filterSectionsByQuery';

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

    const filteredGroups = filterSectionsByQuery(
      transactionsGrouped,
      searchQuery,
      (transaction: TransactionProps) => transaction.description
    );

    return flattenTransactionsForFlashList(filteredGroups);
  }, [searchQuery, flattenedTransactions, transactionsGrouped]);

  return {
    filteredTransactions,
  };
}
