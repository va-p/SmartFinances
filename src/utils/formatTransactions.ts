import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';

import { TransactionProps } from '@interfaces/transactions';

// Maps raw API transactions to the display shape consumed by
// processTransactions and TransactionListItem: display date as dd/MM/yyyy
// (from `transaction_date` when the backend provides it, so imports group
// under their real date instead of the import day) and currency-formatted
// amount fields. The raw `transaction_date` is carried through for the
// downstream `?? created_at` readers.
export function formatTransactions(
  transactions: TransactionProps[]
): TransactionProps[] {
  return transactions.map((item) => ({
    id: item.id,
    created_at: formatDatePtBr(item.transaction_date ?? item.created_at).short(),
    transaction_date: item.transaction_date,
    description: item.description || '',
    amount: item.amount,
    amount_formatted: formatCurrency(item.currency.code, item.amount),
    amount_in_account_currency: item.amount_in_account_currency,
    amount_in_account_currency_formatted: item.amount_in_account_currency
      ? formatCurrency(
        item.account.currency.code,
        item.amount_in_account_currency
      )
      : undefined,
    currency: item.currency,
    type: item.type,
    account: item.account,
    category: item.category,
    tags: item.tags,
    user_id: item.user_id,
  }));
}
