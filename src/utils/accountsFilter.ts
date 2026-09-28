import { AccountProps } from '@interfaces/accounts';
import { TransactionProps } from '@interfaces/transactions';

const ALL_ACCOUNTS_FILTER_LABEL = 'Todas...';

/**
 * Home accounts filter (ACCFLT-04): an empty selection means no filter, so
 * the full list is returned untouched; otherwise only transactions whose
 * account id is in the selection pass through.
 */
export const filterTransactionsByAccounts = (
  transactions: TransactionProps[],
  selectedAccounts: AccountProps[]
): TransactionProps[] => {
  if (selectedAccounts.length === 0) {
    return transactions;
  }

  const selectedAccountIds = new Set(
    selectedAccounts.map((account) => account.id)
  );

  // `account` can be missing on optimistic updates (same guard as
  // processTransactions) — those transactions are excluded while a
  // filter is active.
  return transactions.filter((transaction) =>
    selectedAccountIds.has(transaction.account?.id)
  );
};

/**
 * Pill label for the Home accounts filter (ACCFLT-03): "Todas..." when
 * nothing is selected, the account name for a single selection, "X Contas"
 * for two or more.
 */
export const getAccountsFilterLabel = (
  selectedAccounts: AccountProps[]
): string => {
  if (selectedAccounts.length === 0) {
    return ALL_ACCOUNTS_FILTER_LABEL;
  }

  if (selectedAccounts.length === 1) {
    return selectedAccounts[0].name;
  }

  return `${selectedAccounts.length} Contas`;
};
