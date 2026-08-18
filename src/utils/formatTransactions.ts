import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';

import { TransactionProps } from '@interfaces/transactions';

// Maps raw API transactions to the display shape consumed by
// processTransactions and TransactionListItem: `created_at` as dd/MM/yyyy and
// currency-formatted amount fields.
export function formatTransactions(
  transactions: TransactionProps[]
): TransactionProps[] {
  return transactions.map((item) => ({
    id: item.id,
    created_at: formatDatePtBr(item.created_at).short(),
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
