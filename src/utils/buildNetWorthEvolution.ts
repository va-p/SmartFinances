import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, parse } from 'date-fns';

type PeriodType = 'months' | 'years' | 'all';

type NetWorthPoint = {
  date: string;
  total: number;
};

type Props = {
  transactions: {
    created_at: string | Date;
    amount: number;
    amount_in_account_currency?: number | null;
    type: string;
  }[];
  totalAssets: number;
  period: PeriodType;
};

/**
 * Builds a month-by-month (or year-by-year) net worth evolution series.
 *
 * Core idea:
 *   current net worth = initial net worth + sum of all period flows
 * Therefore:
 *   initial net worth = current net worth − sum of all period flows
 *
 * We compute the net flow per period, then seed the accumulated total with
 * the initial net worth so the series starts at the correct historical level
 * and ends exactly at `totalAssets` (the current net worth).
 *
 * Amount-sign handling: new DEBIT transactions are saved as negative, but
 * older data may still have positive values for both CREDIT and DEBIT.  The
 * sign is derived from the transaction type — DEBIT always reduces net
 * worth, CREDIT always increases it.  Transfers are excluded because they
 * move money between accounts without changing net worth.
 */
export function buildNetWorthEvolution({
  transactions,
  totalAssets,
  period,
}: Props): NetWorthPoint[] {
  if (period === 'all') {
    return [{ date: 'Todo o \n histórico', total: totalAssets }];
  }

  const periodConfig = {
    months: {
      groupKey: (date: Date) => format(date, 'yyyy-MM'),
      outputFormat: "MMM '\n' yyyy",
      parseFormat: 'yyyy-MM',
    },
    years: {
      groupKey: (date: Date) => format(date, 'yyyy'),
      outputFormat: 'yyyy',
      parseFormat: 'yyyy',
    },
  };
  const config = periodConfig[period] || periodConfig.months;

  // ── 1. Net flow per period ───────────────────────────────────────────────
  const totalsByPeriod: Record<string, Decimal> = {};

  for (const transaction of transactions) {
    const transactionDate = new Date(transaction.created_at);
    if (isNaN(transactionDate.getTime())) continue;
    if (transactionDate > new Date()) continue;

    if (
      transaction.type === 'TRANSFER_CREDIT' ||
      transaction.type === 'TRANSFER_DEBIT'
    ) {
      continue;
    }

    const rawAmount =
      transaction.amount_in_account_currency ?? transaction.amount;
    const isDebit = transaction.type === 'DEBIT';
    const signedAmount = isDebit
      ? -Math.abs(Number(rawAmount))
      : Math.abs(Number(rawAmount));

    const periodKey = config.groupKey(transactionDate);
    if (!totalsByPeriod[periodKey]) {
      totalsByPeriod[periodKey] = new Decimal(0);
    }
    totalsByPeriod[periodKey] = totalsByPeriod[periodKey].plus(signedAmount);
  }

  // ── 2. Initial net worth ──────────────────────────────────────────────────
  let sumOfAllFlows = new Decimal(0);
  for (const periodTotal of Object.values(totalsByPeriod)) {
    sumOfAllFlows = sumOfAllFlows.plus(periodTotal);
  }

  let accumulatedTotal = new Decimal(totalAssets).minus(sumOfAllFlows);

  // ── 3. Build the series (oldest → newest) ─────────────────────────────────
  const sortedPeriods = Object.keys(totalsByPeriod).sort((a, b) =>
    a.localeCompare(b)
  );

  return sortedPeriods.map((periodKey) => {
    accumulatedTotal = accumulatedTotal.plus(totalsByPeriod[periodKey]);

    return {
      date: format(
        parse(periodKey, config.parseFormat, new Date()),
        config.outputFormat,
        { locale: ptBR }
      ),
      total: accumulatedTotal.toNumber(),
    };
  });
}
