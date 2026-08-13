import { AccountProps } from '@interfaces/accounts';

/**
 * Returns the user's default account, if any (spec default-account AC-5).
 * Pre-selection only applies when no account context is already selected.
 */
export function pickDefaultAccount(
  accounts: AccountProps[] | undefined
): AccountProps | undefined {
  if (!accounts || accounts.length === 0) {
    return undefined;
  }
  return accounts.find((account) => account.isDefault === true);
}
