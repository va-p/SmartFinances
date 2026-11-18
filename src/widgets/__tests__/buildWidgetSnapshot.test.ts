import { CurrencyCodes } from '@interfaces/currencies';
import { FormattedBudgetProps } from '@interfaces/budget';
import { AccountProps } from '@interfaces/accounts';
import { TransactionProps } from '@interfaces/transactions';
import { Quotes } from '@utils/baseCurrency';

import { buildWidgetSnapshot } from '../buildWidgetSnapshot';

const QUOTES = {} as Quotes;
const NOW = new Date(2026, 10, 15, 12, 0, 0);

// F2 — non-BRL base currency passes through pre-formatted strings (quotes
// mirror the calculateTotalAssets fixture: 1 BRL = 0.2 USD).
const USD_QUOTES = {
  brlQuoteBtc: { price: 0.000003 },
  brlQuoteEur: { price: 0.16 },
  brlQuoteUsd: { price: 0.2 },
  btcQuoteBrl: { price: 300000 },
  btcQuoteEur: { price: 48000 },
  btcQuoteUsd: { price: 60000 },
  eurQuoteBrl: { price: 6.25 },
  eurQuoteBtc: { price: 0.00002 },
  eurQuoteUsd: { price: 1.25 },
  usdQuoteBrl: { price: 5 },
  usdQuoteBtc: { price: 0.000016 },
  usdQuoteEur: { price: 0.8 },
} as unknown as Quotes;

function makeBudget(overrides: Partial<FormattedBudgetProps> = {}) {
  return {
    id: 'b1',
    name: 'Lazer',
    amount: 1000,
    amount_spent: 308,
    percentage: 30.8,
    currency: { code: 'BRL' },
    categories: [],
    start_date: '2026-11-01',
    recurrence: 'monthly',
    user_id: 'u1',
    transactions: [],
    ...overrides,
  } as unknown as FormattedBudgetProps;
}

function makeAccount(overrides: Partial<AccountProps> = {}) {
  return {
    id: 1,
    name: 'Conta',
    currency: { code: 'BRL' },
    type: 'BANK',
    balance: 1000,
    initialAmount: 0,
    ...overrides,
  } as unknown as AccountProps;
}

function makeTransaction(overrides: Partial<TransactionProps> = {}) {
  return {
    id: 1,
    created_at: '2026-11-10T12:00:00.000Z',
    description: 't',
    amount: 100,
    amount_formatted: 'R$ 100,00',
    currency: { code: 'BRL' },
    type: 'CREDIT',
    account: makeAccount(),
    category: { id: 'c1' },
    tags: [],
    user_id: 'u1',
    ...overrides,
  } as unknown as TransactionProps;
}

function baseInput(overrides = {}) {
  return {
    budgets: [],
    transactions: [],
    accounts: [],
    categories: [],
    quotes: QUOTES,
    baseCurrencyCode: 'BRL' as CurrencyCodes,
    hidden: false,
    signedIn: true,
    now: NOW,
    ...overrides,
  };
}

describe('buildWidgetSnapshot', () => {
  // WDG-11 — header values: current month label + income/expenses totals
  it('totals the current month income and expenses', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        transactions: [
          makeTransaction({ type: 'CREDIT', amount: 6450 }),
          makeTransaction({ type: 'DEBIT', amount: 4890.12 }),
        ],
      })
    );

    expect(snapshot.cashFlow.monthLabel).toBe('Novembro');
    expect(snapshot.cashFlow.income).toBe('R$\u00A06.450,00');
    expect(snapshot.cashFlow.expenses).toBe('-R$\u00A04.890,12');
  });

  // WDG-36/edge — future transactions never count (FUT-08 precedent)
  it('excludes future and transfer transactions from cash flow', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        transactions: [
          makeTransaction({ type: 'CREDIT', amount: 6450 }),
          makeTransaction({
            id: 2,
            type: 'DEBIT',
            amount: 9999,
            created_at: '2026-12-01T12:00:00.000Z',
          }),
          makeTransaction({ id: 3, type: 'TRANSFER_DEBIT', amount: 500 }),
        ],
      })
    );

    expect(snapshot.cashFlow.income).toBe('R$\u00A06.450,00');
    expect(snapshot.cashFlow.expenses).toBe('R$\u00A00,00');
  });

  // WDG-16 — empty month renders zero totals
  it('renders zero totals when the month has no transactions', () => {
    const snapshot = buildWidgetSnapshot(baseInput());

    expect(snapshot.cashFlow.income).toBe('R$\u00A00,00');
    expect(snapshot.cashFlow.expenses).toBe('R$\u00A00,00');
  });

  // WDG-17/22 — critical budget drives the alert; hidden below 80%
  it('surfaces the highest-percent budget as the critical alert', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        budgets: [
          makeBudget({ name: 'Lazer', percentage: 30.8 }),
          makeBudget({ name: 'Moradia e Contas', percentage: 102.48 }),
        ],
      })
    );

    expect(snapshot.overview.alertName).toBe('Moradia e Contas');
    expect(snapshot.overview.alertPercent).toBe('102,48%');
    expect(snapshot.overview.alertOver).toBe(true);
    expect(snapshot.overview.criticalName).toBe('Moradia e Contas');
    expect(snapshot.budgets[0].name).toBe('Moradia e Contas');
  });

  it('hides the alert when no budget exceeds 80%', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({ budgets: [makeBudget({ percentage: 30.8 })] })
    );

    expect(snapshot.overview.alertName).toBeNull();
    expect(snapshot.overview.alertPercent).toBeNull();
  });

  // WDG-29/30/31 — net worth plus top-2 institutions by balance
  it('lists the top 2 institutions by balance', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        accounts: [
          makeAccount({ id: 1, institution: { id: 'nub', name: 'Nubank' }, balance: 4250.1 }),
          makeAccount({ id: 2, institution: { id: 'nub', name: 'Nubank' }, balance: 0 }),
          makeAccount({ id: 3, institution: { id: 'itau', name: 'Itaú' }, balance: 1890.45 }),
          makeAccount({ id: 4, institution: { id: 'xp', name: 'XP' }, balance: 100 }),
        ],
      })
    );

    expect(snapshot.netWorth.total).toBe('R$\u00A06.240,55');
    expect(snapshot.institutions.map((i) => i.name)).toEqual([
      'Nubank',
      'Itaú',
    ]);
    expect(snapshot.institutions[0].accountCount).toBe(2);
  });

  // WDG-34 — no accounts renders zero total
  it('renders a zero total with no institutions when accounts are empty', () => {
    const snapshot = buildWidgetSnapshot(baseInput());

    expect(snapshot.netWorth.total).toBe('R$\u00A00,00');
    expect(snapshot.institutions).toEqual([]);
  });

  // WDG-21/WDG-33 — hide-amounts masks every balance
  it('masks totals and institution balances when hidden', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        hidden: true,
        accounts: [makeAccount({ balance: 1000 })],
      })
    );

    expect(snapshot.hidden).toBe(true);
    expect(snapshot.netWorth.total).toBe('R$\u00A0••••');
    expect(snapshot.overview.total).toBe('R$\u00A0••••');
    expect(snapshot.institutions[0].balance).toBe('R$\u00A0••••');
  });

  // Edge — non-BRL base currency converts before formatting (spec: snapshot
  // carries pre-formatted strings; native widgets display them unchanged).
  it('converts and formats totals in a non-BRL base currency', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        baseCurrencyCode: 'USD' as CurrencyCodes,
        quotes: USD_QUOTES,
        transactions: [makeTransaction({ type: 'CREDIT', amount: 100 })],
        accounts: [makeAccount({ balance: 1000 })],
      })
    );

    expect(snapshot.cashFlow.income).toBe('US$\u00A020,00');
    expect(snapshot.netWorth.total).toBe('US$\u00A0200,00');
    expect(snapshot.institutions[0].balance).toBe('US$\u00A0200,00');
  });

  // WDG-51 — Large lists the two worst budgets in descending order.
  it('emits the top two critical budgets', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        budgets: [
          makeBudget({ name: 'Lazer', percentage: 30.8 }),
          makeBudget({ name: 'Moradia e Contas', percentage: 102.48 }),
          makeBudget({ name: 'Alimentação', percentage: 95.5 }),
        ],
      })
    );

    expect(snapshot.overview.topCritical.map((b) => b.name)).toEqual([
      'Moradia e Contas',
      'Alimentação',
    ]);
    expect(snapshot.overview.topCritical[0].percent).toBe('102,48%');
    expect(snapshot.overview.criticalName).toBe('Moradia e Contas');
  });

  it('leaves top-critical percents visible when hidden (only balances mask)', () => {
    const snapshot = buildWidgetSnapshot(
      baseInput({
        hidden: true,
        budgets: [makeBudget({ name: 'Moradia e Contas', percentage: 102.48 })],
      })
    );

    expect(snapshot.overview.topCritical).toHaveLength(1);
    expect(snapshot.overview.topCritical[0].percent).toBe('102,48%');
  });

  // WDG-37 — signed-out state is flagged for the native placeholder
  it('flags signed-out state without leaking values', () => {
    const snapshot = buildWidgetSnapshot(baseInput({ signedIn: false }));

    expect(snapshot.signedIn).toBe(false);
  });
});
