import Decimal from 'decimal.js';

import { CurrencyCodes } from '@interfaces/currencies';
import { AccountProps } from '@interfaces/accounts';
import { convertCurrency } from '@utils/convertCurrency';
import { Quotes } from '@utils/baseCurrency';

type Props = {
  accounts: Pick<AccountProps, 'balance' | 'currency' | 'hide'>[];
  baseCurrencyCode: CurrencyCodes;
  quotes: Quotes;
};

/**
 * Single source of truth for the user's current net worth: the sum of all
 * non-hidden account balances converted to the base currency (NW-01).
 *
 * Both the Accounts and Overview screens seed their net worth charts from
 * this helper, so the final chart point always equals the displayed total.
 * Decimal accumulation avoids the float noise of `+=` (NW-04), and accounts
 * with unsupported conversions are skipped, mirroring the period flows
 * (BC-23). Virtual goal reserves stay included (GOAL-25); callers fetch
 * them via `useAccountsQuery(true)`.
 */
export function calculateTotalAssets({
  accounts,
  baseCurrencyCode,
  quotes,
}: Props): number {
  let total = new Decimal(0);

  accounts
    .filter((account) => !account.hide)
    .forEach((account) => {
      try {
        const converted = convertCurrency({
          amount: Number(account.balance),
          fromCurrency: account.currency.code,
          toCurrency: baseCurrencyCode,
          accountCurrency: account.currency.code,
          quotes,
        });
        total = total.plus(converted);
      } catch {
        // Unsupported pair: skip instead of breaking the total (BC-23).
      }
    });

  return total.toNumber();
}
