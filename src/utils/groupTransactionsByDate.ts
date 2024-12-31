import { TransactionProps } from '@interfaces/transactions';

function groupTransactionsByDate(transactions: TransactionProps[]) {
  const transactionsGrouped = transactions.reduce(
    (acc: any, transaction: any) => {
      const existObj = acc.find(
        (obj: any) => obj.title === transaction.created_at
      );

      if (existObj) {
        existObj.data.push(transaction);
      } else {
        acc.push({
          title: transaction.created_at,
          data: [transaction],
          total: 0, // Inicializa o total para cada data
        });
      }
      return acc;
    },
    []
  );

  // Calcula o total para cada data, considerando o tipo de conta
  transactionsGrouped.forEach((group: any) => {
    let totalByDate = 0;
    group.data.forEach((transaction: TransactionProps) => {
      // Credit card
      if (
        transaction.type !== 'TRANSFER_CREDIT' &&
        transaction.type !== 'TRANSFER_DEBIT' &&
        transaction.account.type === 'CREDIT'
      ) {
        totalByDate -= transaction.amount; // Inverte a lógica para cartões de crédito
      }
      // Other account types
      if (
        transaction.type !== 'TRANSFER_CREDIT' &&
        transaction.type !== 'TRANSFER_DEBIT' &&
        transaction.account.type !== 'CREDIT'
      ) {
        totalByDate += transaction.amount;
      }
    });

    group.total = Number(totalByDate).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  });

  return transactionsGrouped;
}

export default groupTransactionsByDate;
