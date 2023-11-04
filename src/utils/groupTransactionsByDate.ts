import { TransactionProps } from '@interfaces/transactions';

function groupTransactionsByDate(transactions: TransactionProps[]) {
  let totalByDate = 0;

  const transactionsGrouped = transactions.reduce(
    (acc: any, transaction: any) => {
      const existObj = acc.find(
        (obj: any) => obj.title === transaction.created_at
      );

      if (existObj) {
        switch (transaction.type) {
          case 'credit':
          case 'transferCredit':
            totalByDate += transaction.amount;
            break;
          case 'debit':
          case 'transferDebit':
            totalByDate -= transaction.amount;
            break;
        }

        existObj.total = Number(totalByDate).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        existObj.data.push(transaction);
      } else {
        switch (transaction.type) {
          case 'credit':
          case 'transferCredit':
            totalByDate = transaction.amount;
            break;
          case 'debit':
          case 'transferDebit':
            totalByDate = transaction.amount * -1;
            break;
        }
        acc.push({
          title: transaction.created_at,
          total: Number(totalByDate).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          data: [transaction],
        });
      }
      return acc;
    },
    []
  );

  return transactionsGrouped;
}

export default groupTransactionsByDate;
