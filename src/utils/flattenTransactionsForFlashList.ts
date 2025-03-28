import { TransactionProps } from '@interfaces/transactions';
import { GroupedTransactionProps } from '@utils/groupTransactionsByDate';

export interface FlashListTransactionItem extends TransactionProps {
  isHeader?: boolean;
  headerTitle?: string;
  headerTotal?: string;
}

export function flattenTransactionsForFlashList(
  groupedTransactions: GroupedTransactionProps[]
): FlashListTransactionItem[] {
  const flattenedTransactions: FlashListTransactionItem[] = [];

  groupedTransactions.forEach((group) => {
    flattenedTransactions.push({
      isHeader: true,
      headerTitle: group.title,
      headerTotal: group.total,
    });
    flattenedTransactions.push(...group.data);
  });

  return flattenedTransactions;
}
