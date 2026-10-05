import { TransactionProps } from '@interfaces/transactions';
import { CurrencyCodes } from '@interfaces/currencies';
import formatCurrency from '@utils/formatCurrency';

export interface GroupedTransactionProps {
  title: string;
  /** Day total formatted in the base currency. */
  total: string;
  /** Exact numeric day total - never re-parse `total` to compute with it. */
  rawTotal: number;
  data: TransactionProps[];
}

const calculateGroupTotal = (transactions: TransactionProps[]): number => {
  const total = transactions.reduce((acc, transaction) => {
    // Skip items without account data (e.g., optimistic updates missing nested objects)
    if (!transaction.account?.type) return acc;

    const isCreditAccount = transaction.account.type === 'CREDIT';
    const isTransfer = transaction.type.includes('TRANSFER');

    if (isTransfer) return acc;

    return isCreditAccount
      ? acc - transaction.amount
      : acc + transaction.amount;
  }, 0);

  return total;
};

function groupTransactionsByDate(
  transactions: TransactionProps[],
  baseCurrencyCode: CurrencyCodes = 'BRL'
): GroupedTransactionProps[] {
  const groupsMap = transactions.reduce(
    (acc, transaction) => {
      const dateKey = transaction.created_at;

      if (!acc.has(dateKey)) {
        acc.set(dateKey, {
          title: dateKey,
          data: [],
          rawTotal: 0,
        });
      }

      const group = acc.get(dateKey);
      group?.data.push(transaction);

      return acc;
    },
    new Map<
      string,
      { title: string; data: TransactionProps[]; rawTotal: number }
    >()
  );

  return Array.from(groupsMap.values()).map((group) => {
    const rawTotal = calculateGroupTotal(group.data);

    return {
      ...group,
      rawTotal,
      total: formatCurrency(baseCurrencyCode, rawTotal),
    };
  });
}

export default groupTransactionsByDate;
