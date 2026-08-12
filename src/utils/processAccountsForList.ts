import { AccountProps } from '@interfaces/accounts';
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from './convertCurrency';

type Quotes = Parameters<typeof convertCurrency>[0]['quotes'];

export type ProcessedAccountListItem = Omit<AccountProps, 'balance'> & {
  /** Formatted balance in the account's own currency (e.g. "R$ 1.234,50"). */
  balance: string;
  /** Numeric balance in the account's own currency, for sorting/comparisons. */
  rawBalance: number;
  /** BRL-converted balance (secondary line), only for non-BRL accounts. */
  totalAccountAmountConverted?: string;
};

/**
 * Prepares raw accounts for list rendering: formats the balance in the
 * account's currency and, for non-BRL accounts, adds the BRL-converted value
 * as a secondary line. Mirrors the data processing on the Accounts screen so
 * `AccountListItem` keeps receiving pre-formatted strings.
 */
export function processAccountsForList(
  accounts: AccountProps[],
  quotes: Quotes
): ProcessedAccountListItem[] {
  return accounts.map((account) => {
    const rawBalance = Number(account.balance);
    const isBRL = account.currency.code === 'BRL';

    let totalAccountAmountConverted: string | undefined;
    if (!isBRL) {
      try {
        const converted = convertCurrency({
          amount: rawBalance,
          fromCurrency: account.currency.code,
          toCurrency: 'BRL',
          accountCurrency: account.currency.code,
          quotes,
        });
        totalAccountAmountConverted = formatCurrency('BRL', converted, false);
      } catch {
        // Unsupported currency pair: omit the secondary line rather than crash.
        totalAccountAmountConverted = undefined;
      }
    }

    return {
      ...account,
      balance: formatCurrency(account.currency.code, rawBalance, false),
      rawBalance,
      totalAccountAmountConverted,
    };
  });
}
