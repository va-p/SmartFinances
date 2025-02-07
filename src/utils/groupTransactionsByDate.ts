import { TransactionProps } from '@interfaces/transactions';

export interface GroupedTransactionProps {
  title: string;
  data: TransactionProps[];
  total: string;
}

export const calculateGroupTotal = (
  transactions: TransactionProps[]
): string => {
  const total = transactions.reduce((acc, transaction) => {
    const isCreditAccount = transaction.account.type === 'CREDIT';
    const isTransfer = transaction.type.includes('TRANSFER');

    if (isTransfer) return acc;

    return isCreditAccount
      ? acc - transaction.amount
      : acc + transaction.amount;
  }, 0);

  return total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

function groupTransactionsByDate(
  transactions: TransactionProps[]
): GroupedTransactionProps[] {
  const groupsMap = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.created_at;

    if (!acc.has(dateKey)) {
      acc.set(dateKey, {
        title: dateKey,
        data: [],
        total: 0,
      });
    }

    const group = acc.get(dateKey)!;
    group.data.push(transaction);

    return acc;
  }, new Map<string, { title: string; data: TransactionProps[]; total: number }>());

  return Array.from(groupsMap.values()).map((group) => ({
    ...group,
    total: calculateGroupTotal(group.data),
  }));
}

export default groupTransactionsByDate;
