import { addDays, addMonths, addWeeks, addYears, endOfMonth } from 'date-fns';
import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';
import { BudgetProps, FormattedBudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

export function formatBudgetInfo(
  budget: BudgetProps,
  transactions: TransactionProps[]
): FormattedBudgetProps {
  let startDate = new Date(budget.start_date);
  let endDate = startDate;

  // 1. Calcula o primeiro período
  switch (budget.recurrence) {
    case 'daily':
      endDate = addDays(new Date(endDate), 1);
      break;
    case 'weekly':
      endDate = addWeeks(new Date(endDate), 1);
      break;
    case 'biweekly':
      endDate = addDays(new Date(endDate), 15);
      break;
    case 'monthly':
      endDate = endOfMonth(endDate);
      break;
    case 'semiannually':
      endDate = addMonths(new Date(endDate), 6);
      break;
    case 'annually':
      endDate = addYears(new Date(endDate), 1);
      break;
  }

  while (endDate < new Date()) {
    switch (budget.recurrence) {
      case 'daily':
        startDate = endDate;
        endDate = addDays(new Date(startDate), 1);
        break;
      case 'weekly':
        startDate = endDate;
        endDate = addWeeks(new Date(startDate), 1);
        break;
      case 'biweekly':
        startDate = endDate;
        endDate = addDays(new Date(startDate), 15);
        break;
      case 'monthly':
        startDate = addMonths(new Date(startDate), 1);
        endDate = endOfMonth(startDate);
        break;
      case 'semiannually':
        startDate = endDate;
        endDate = addMonths(new Date(startDate), 6);
        break;
      case 'annually':
        startDate = endDate;
        endDate = addYears(new Date(startDate), 1);
        break;
    }
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      budget.categories.find(
        (cat: any) => cat.category_id === transaction.category.id
      ) &&
      new Date(transaction.created_at) >= startDate &&
      new Date(transaction.created_at) <= endDate
  );

  let amountSpent = 0;
  for (const transaction of filteredTransactions) {
    const isTransactionInAnotherCurrency =
      transaction.currency.code !== transaction.account.currency.code;

    if (
      transaction.type === 'TRANSFER_CREDIT' ||
      transaction.type === 'TRANSFER_DEBIT'
    ) {
      continue;
    }

    const amount =
      isTransactionInAnotherCurrency && transaction.amount_in_account_currency
        ? transaction.amount_in_account_currency
        : transaction.amount;

    if (transaction.account.type === 'CREDIT') {
      amountSpent += amount;
    } else {
      amountSpent -= amount;
    }

    transaction.amount_in_account_currency
      ? (transaction.amount_in_account_currency_formatted = formatCurrency(
          transaction.account.currency.code,
          transaction.amount_in_account_currency
        ))
      : (transaction.amount_formatted = formatCurrency(
          transaction.account.currency.code,
          transaction.amount
        ));
  }

  const percentage = (amountSpent / Number(budget.amount)) * 100;

  return {
    ...budget,
    amount_spent: amountSpent,
    percentage,
    current_start_date: startDate,
    current_end_date: endDate,
    formatted_start_date: formatDatePtBr(startDate).medium(),
    formatted_end_date: formatDatePtBr(endDate).medium(),
    budget_transactions: filteredTransactions,
  };
}
