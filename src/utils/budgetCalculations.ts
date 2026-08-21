import { addDays, addMonths, addWeeks, addYears, endOfMonth } from 'date-fns';
import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';
import { BudgetProps, FormattedBudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

export type BudgetPeriod = {
  startDate: Date;
  endDate: Date;
};

function getFirstPeriodEnd(recurrence: string, startDate: Date): Date {
  switch (recurrence) {
    case 'daily':
      return addDays(new Date(startDate), 1);
    case 'weekly':
      return addWeeks(new Date(startDate), 1);
    case 'biweekly':
      return addDays(new Date(startDate), 15);
    case 'monthly':
      return endOfMonth(startDate);
    case 'semiannually':
      return addMonths(new Date(startDate), 6);
    case 'annually':
      return addYears(new Date(startDate), 1);
    default:
      return new Date(startDate);
  }
}

function stepPeriod(
  recurrence: string,
  startDate: Date,
  endDate: Date
): BudgetPeriod {
  switch (recurrence) {
    case 'daily':
      return { startDate: endDate, endDate: addDays(new Date(endDate), 1) };
    case 'weekly':
      return { startDate: endDate, endDate: addWeeks(new Date(endDate), 1) };
    case 'biweekly':
      return { startDate: endDate, endDate: addDays(new Date(endDate), 15) };
    case 'monthly': {
      const nextStartDate = addMonths(new Date(startDate), 1);
      return { startDate: nextStartDate, endDate: endOfMonth(nextStartDate) };
    }
    case 'semiannually':
      return { startDate: endDate, endDate: addMonths(new Date(endDate), 6) };
    case 'annually':
      return { startDate: endDate, endDate: addYears(new Date(endDate), 1) };
    default:
      return { startDate, endDate };
  }
}

export function getBudgetPeriods(
  budget: Pick<BudgetProps, 'start_date' | 'recurrence'>,
  upTo: Date = new Date()
): BudgetPeriod[] {
  // Normalize recurrence to lowercase — backend stores uppercase enum values.
  const recurrence = (budget.recurrence || '').toLowerCase();

  let startDate = new Date(budget.start_date);
  let endDate = getFirstPeriodEnd(recurrence, startDate);

  const periods: BudgetPeriod[] = [{ startDate, endDate }];

  while (endDate < upTo) {
    const nextPeriod = stepPeriod(recurrence, startDate, endDate);

    // Guard against unknown recurrences, which would otherwise never advance.
    if (
      nextPeriod.startDate.getTime() === startDate.getTime() &&
      nextPeriod.endDate.getTime() === endDate.getTime()
    ) {
      break;
    }

    startDate = nextPeriod.startDate;
    endDate = nextPeriod.endDate;
    periods.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  return periods;
}

export function getTransactionSpentAmount(
  transaction: TransactionProps
): number {
  if (
    transaction.type === 'TRANSFER_CREDIT' ||
    transaction.type === 'TRANSFER_DEBIT'
  ) {
    return 0;
  }

  const isTransactionInAnotherCurrency =
    transaction.currency.code !== transaction.account.currency.code;

  const amount =
    isTransactionInAnotherCurrency && transaction.amount_in_account_currency
      ? transaction.amount_in_account_currency
      : transaction.amount;

  return transaction.account.type === 'CREDIT' ? amount : -amount;
}

export function formatBudgetInfo(
  budget: BudgetProps,
  transactions: TransactionProps[],
  upTo: Date = new Date()
): FormattedBudgetProps {
  const periods = getBudgetPeriods(budget, upTo);
  const { startDate, endDate } = periods[periods.length - 1];

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
    const isTransfer =
      transaction.type === 'TRANSFER_CREDIT' ||
      transaction.type === 'TRANSFER_DEBIT';

    if (isTransfer) {
      continue;
    }

    amountSpent += getTransactionSpentAmount(transaction);

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
