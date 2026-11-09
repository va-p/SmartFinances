import Decimal from 'decimal.js';

import { CurrencyCodes } from '@interfaces/currencies';
import { AccountProps } from '@interfaces/accounts';
import { TransactionProps } from '@interfaces/transactions';
import { calculateTotalAssets } from '@utils/calculateTotalAssets';
import { convertToBaseCurrency, Quotes } from '@utils/baseCurrency';

type Props = {
  accounts: Pick<AccountProps, 'balance' | 'currency' | 'hide'>[];
  transactions: Pick<
    TransactionProps,
    'created_at' | 'amount' | 'amount_in_account_currency' | 'type' | 'account'
  >[];
  baseCurrencyCode: CurrencyCodes;
  quotes: Quotes;
  now?: Date;
};

/**
 * Realized net worth (FUT-05): the balance sum minus converted future flows.
 *
 * Account balances already include scheduled future transactions (the backend
 * increments on create regardless of `created_at`), so the displayed total
 * backs those effects out. Sign, conversion, and skip rules mirror
 * `buildNetWorthEvolution` exactly: DEBIT reduces, CREDIT increases,
 * transfers are excluded, and unsupported currencies or missing account data
 * are skipped. Future means `created_at > now`; equal-to-now counts as
 * realized.
 */
export function calculateRealizedTotalAssets({
  accounts,
  transactions,
  baseCurrencyCode,
  quotes,
  now = new Date(),
}: Props): number {
  const total = new Decimal(
    calculateTotalAssets({ accounts, baseCurrencyCode, quotes })
  );

  let futureFlows = new Decimal(0);
  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.created_at);
    if (Number.isNaN(transactionDate.getTime())) return;
    if (transactionDate <= now) return;

    if (!transaction.type || transaction.type.includes('TRANSFER')) return;

    const accountCurrency = transaction.account?.currency?.code;
    if (!accountCurrency) return;

    const converted = convertToBaseCurrency(
      Math.abs(
        Number(
          transaction.amount_in_account_currency ?? transaction.amount
        )
      ),
      accountCurrency,
      baseCurrencyCode,
      quotes
    );
    if (converted === null) return;

    futureFlows =
      transaction.type === 'DEBIT'
        ? futureFlows.minus(converted)
        : futureFlows.plus(converted);
  });

  return total.minus(futureFlows).toNumber();
}
