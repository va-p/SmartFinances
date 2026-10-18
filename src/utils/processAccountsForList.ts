import { AccountProps } from '@interfaces/accounts';
import { CurrencyCodes } from '@interfaces/currencies';
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from './convertCurrency';

type Quotes = Parameters<typeof convertCurrency>[0]['quotes'];

export type ProcessedAccountListItem = Omit<AccountProps, 'balance'> & {
  /** Formatted balance in the account's own currency (e.g. "R$ 1.234,50"). */
  balance: string;
  /** Numeric balance in the account's own currency, for sorting/comparisons. */
  rawBalance: number;
  /** Numeric base-currency-normalized balance, used as the balance-sort key. */
  balanceConvertedToBase: number;
  /** Base-currency-converted balance (secondary line), only for accounts not
   *  in the base currency. */
  totalAccountAmountConverted?: string;
};

/**
 * Prepares raw accounts for list rendering: formats the balance in the
 * account's currency and, for accounts not in the base currency, adds the
 * base-converted value as a secondary line. Mirrors the data processing on
 * the Accounts screen so `AccountListItem` keeps receiving pre-formatted
 * strings.
 */
export function processAccountsForList(
  accounts: AccountProps[],
  quotes: Quotes,
  baseCurrencyCode: CurrencyCodes = 'BRL'
): ProcessedAccountListItem[] {
  return accounts.map((account) => {
    const rawBalance = Number(account.balance);
    const isBaseCurrency = account.currency.code === baseCurrencyCode;

    let balanceConvertedToBase = rawBalance;
    let totalAccountAmountConverted: string | undefined;
    if (!isBaseCurrency) {
      try {
        const converted = convertCurrency({
          amount: rawBalance,
          fromCurrency: account.currency.code,
          toCurrency: baseCurrencyCode,
          accountCurrency: account.currency.code,
          quotes,
        });
        balanceConvertedToBase = converted;
        totalAccountAmountConverted = formatCurrency(
          baseCurrencyCode,
          converted,
          false
        );
      } catch {
        // Unsupported currency pair: omit the secondary line rather than crash.
        totalAccountAmountConverted = undefined;
      }
    }

    return {
      ...account,
      balance: formatCurrency(account.currency.code, rawBalance, false),
      rawBalance,
      balanceConvertedToBase,
      totalAccountAmountConverted,
    };
  });
}
