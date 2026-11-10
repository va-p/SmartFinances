import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import formatCurrency from '@utils/formatCurrency';
import { calculateTotalAssets } from '@utils/calculateTotalAssets';
import { buildNetWorthEvolution } from '@utils/buildNetWorthEvolution';
import { Quotes, convertToBaseCurrency } from '@utils/baseCurrency';

import { CurrencyCodes } from '@interfaces/currencies';
import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';
import { FormattedBudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

import { buildBudgetsSnapshot } from './buildBudgetsSnapshot';
import {
  WidgetCashFlow,
  WidgetInstitutionRow,
  WidgetNetWorth,
  WidgetOverview,
  WidgetSnapshot,
} from './widgetSnapshotTypes';

// Masked placeholder shown by every widget when hide-amounts is on (the
// eye icon). Uses the same non-breaking space `formatCurrency` emits.
export const WIDGET_MASKED_VALUE = 'R$\u00A0••••';

const ALERT_THRESHOLD_PERCENT = 80;
const MAX_DONUT_SLICES = 6;
const MAX_SPARK_POINTS = 12;

export interface ComposerInput {
  budgets: FormattedBudgetProps[];
  transactions: TransactionProps[];
  accounts: AccountProps[];
  categories: CategoryProps[];
  quotes: Quotes;
  baseCurrencyCode: CurrencyCodes;
  hidden: boolean;
  signedIn: boolean;
  now?: Date;
  generatedAt?: string;
}

function monthLabel(now: Date): string {
  const raw = format(now, 'MMMM', { locale: ptBR });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function isRealizedMonthTransaction(
  t: TransactionProps,
  now: Date
): t is TransactionProps & { created_at: string | Date } {
  const date = new Date(t.created_at);
  if (Number.isNaN(date.getTime())) return false;
  if (date > now) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function convertedAbs(
  t: TransactionProps,
  baseCurrencyCode: CurrencyCodes,
  quotes: Quotes
): number | null {
  const raw = Math.abs(Number(t.amount_in_account_currency ?? t.amount));
  if (!Number.isFinite(raw)) return null;
  return convertToBaseCurrency(
    raw,
    t.account.currency.code,
    baseCurrencyCode,
    quotes
  );
}

function buildCashFlow(
  transactions: TransactionProps[],
  baseCurrencyCode: CurrencyCodes,
  quotes: Quotes,
  now: Date,
  hidden: boolean
): WidgetCashFlow {
  let income = new Decimal(0);
  let expenses = new Decimal(0);
  const byDay = new Map<number, { income: Decimal; expense: Decimal }>();

  transactions.forEach((t) => {
    if (t.type !== 'CREDIT' && t.type !== 'DEBIT') return;
    if (!isRealizedMonthTransaction(t, now)) return;

    const value = convertedAbs(t, baseCurrencyCode, quotes);
    if (value === null) return;

    const day = new Date(t.created_at).getDate();
    const bucket = byDay.get(day) ?? {
      income: new Decimal(0),
      expense: new Decimal(0),
    };

    if (t.type === 'CREDIT') {
      income = income.plus(value);
      bucket.income = bucket.income.plus(value);
    } else {
      expenses = expenses.plus(value);
      bucket.expense = bucket.expense.plus(value);
    }
    byDay.set(day, bucket);
  });

  const bars = [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, bucket]) => ({
      income: bucket.income.toNumber(),
      expense: bucket.expense.toNumber(),
    }));

  const expenseTotal = expenses.toNumber();

  return {
    monthLabel: monthLabel(now),
    income: hidden ? WIDGET_MASKED_VALUE : formatCurrency(baseCurrencyCode, income.toNumber()),
    expenses: hidden ? WIDGET_MASKED_VALUE : formatCurrency(
      baseCurrencyCode,
      expenseTotal === 0 ? 0 : -expenseTotal
    ),
    bars,
  };
}

function buildOverview(
  budgets: FormattedBudgetProps[],
  total: string,
): WidgetOverview {
  const critical =
    budgets.length === 0
      ? null
      : [...budgets].sort((a, b) => b.percentage - a.percentage)[0];

  // Percents stay visible even when hidden: only absolute balances mask
  // (income/expenses/total/institutions). Matches the cashflow masking rule.
  const percentLabel = (p: number) =>
    `${p.toFixed(2).replace('.', ',')}%`;
  // WDG-51: the two worst budgets for the Large widget (no alert threshold:
  // worst-performing means highest spend, consistent with criticalName above).
  const topCritical = [...budgets]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map((budget) => ({
      name: budget.name,
      percent: percentLabel(budget.percentage),
    }));

  if (!critical || critical.percentage <= ALERT_THRESHOLD_PERCENT) {
    return {
      total,
      alertName: null,
      alertPercent: null,
      alertOver: false,
      criticalName: critical?.name ?? null,
      criticalPercent: critical ? percentLabel(critical.percentage) : null,
      topCritical,
    };
  }

  return {
    total,
    alertName: critical.name,
    alertPercent: percentLabel(critical.percentage),
    alertOver: critical.percentage > 100,
    criticalName: critical.name,
    criticalPercent: percentLabel(critical.percentage),
    topCritical,
  };
}

function buildNetWorth(
  transactions: TransactionProps[],
  accounts: AccountProps[],
  categories: CategoryProps[],
  quotes: Quotes,
  baseCurrencyCode: CurrencyCodes,
  now: Date,
  hidden: boolean
): { total: string; netWorth: WidgetNetWorth } {
  const totalAssets = calculateTotalAssets({
    accounts,
    baseCurrencyCode,
    quotes,
  });

  const spark = buildNetWorthEvolution({
    transactions,
    totalAssets,
    period: 'months',
    quotes,
    baseCurrencyCode,
  })
    .slice(-MAX_SPARK_POINTS)
    .map((point) => point.total);

  // Donut mirrors the Overview screen's selected-month category totals.
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const byCategory = new Map<string, Decimal>();
  transactions.forEach((t) => {
    if (t.type !== 'DEBIT') return;
    if (!isRealizedMonthTransaction(t, now)) return;

    const value = convertedAbs(t, baseCurrencyCode, quotes);
    if (value === null || value === 0) return;

    const { id } = t.category;
    byCategory.set(id, (byCategory.get(id) ?? new Decimal(0)).plus(value));
  });

  const donut = [...byCategory.entries()]
    .sort(([, a], [, b]) => b.comparedTo(a))
    .slice(0, MAX_DONUT_SLICES)
    .map(([categoryId, sum]) => ({
      categoryId,
      value: sum.toNumber(),
      label: names.get(categoryId) ?? categoryId,
    }));

  const total = hidden
    ? WIDGET_MASKED_VALUE
    : formatCurrency(baseCurrencyCode, totalAssets);

  return { total, netWorth: { total, spark, donut } };
}

function buildInstitutions(
  accounts: AccountProps[],
  quotes: Quotes,
  baseCurrencyCode: CurrencyCodes,
  hidden: boolean
): WidgetInstitutionRow[] {
  const groups = new Map<
    string,
    { name: string; accountCount: number; balance: Decimal }
  >();

  accounts
    .filter((account) => !account.hide)
    .forEach((account) => {
      const key = account.institution?.id ?? `account:${account.id}`;
      const name = account.institution?.name ?? account.name;
      const group = groups.get(key) ?? {
        name,
        accountCount: 0,
        balance: new Decimal(0),
      };

      group.accountCount += 1;
      const converted = convertToBaseCurrency(
        Number(account.balance),
        account.currency.code,
        baseCurrencyCode,
        quotes
      );
      if (converted !== null && Number.isFinite(converted)) {
        group.balance = group.balance.plus(converted);
      }
      groups.set(key, group);
    });

  return [...groups.values()]
    .sort((a, b) => b.balance.comparedTo(a.balance))
    .slice(0, 2)
    .map((group, index) => ({
      id: `institution-${index}`,
      name: group.name,
      accountCount: group.accountCount,
      balance: hidden
        ? WIDGET_MASKED_VALUE
        : formatCurrency(baseCurrencyCode, group.balance.toNumber()),
    }));
}

export function buildWidgetSnapshot(input: ComposerInput): WidgetSnapshot {
  const now = input.now ?? new Date();
  const budgets = buildBudgetsSnapshot(input.budgets);
  const cashFlow = buildCashFlow(
    input.transactions,
    input.baseCurrencyCode,
    input.quotes,
    now,
    input.hidden
  );
  const { total, netWorth } = buildNetWorth(
    input.transactions,
    input.accounts,
    input.categories,
    input.quotes,
    input.baseCurrencyCode,
    now,
    input.hidden
  );

  return {
    version: 1,
    generatedAt: input.generatedAt ?? now.toISOString(),
    signedIn: input.signedIn,
    hidden: input.hidden,
    baseCurrencyCode: input.baseCurrencyCode,
    budgets,
    cashFlow,
    overview: buildOverview(input.budgets, total),
    netWorth,
    institutions: buildInstitutions(
      input.accounts,
      input.quotes,
      input.baseCurrencyCode,
      input.hidden
    ),
  };
}
