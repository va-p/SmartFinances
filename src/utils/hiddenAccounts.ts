type HideableAccount = { hide?: boolean } | null | undefined;

interface TransactionWithAccount {
  account?: HideableAccount;
}

/**
 * Single definition of "transaction belongs to a hidden account".
 *
 * Returns true only for an explicit `account.hide === true`. A missing flag
 * or a missing/null account means visible, matching the `calculateTotalAssets`
 * filter semantics so old payloads and optimistic rows never vanish.
 */
export function isHiddenAccountTransaction(
  transaction: TransactionWithAccount,
): boolean {
  return transaction.account?.hide === true;
}

/**
 * Non-mutating, order-preserving filter that drops hidden-account rows.
 */
export function excludeHiddenAccountTransactions<
  T extends TransactionWithAccount,
>(transactions: T[]): T[] {
  return transactions.filter(
    (transaction) => !isHiddenAccountTransaction(transaction),
  );
}
