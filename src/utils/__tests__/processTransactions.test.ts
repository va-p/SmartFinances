import { processTransactions } from '../processTransactions';

import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;
const usd = { id: 5, name: 'US Dollar', code: 'USD', symbol: '$' } as const;
const eth = { id: 4, name: 'Ethereum', code: 'ETH', symbol: 'Ξ' } as const;

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 9,
  // Midday UTC keeps the local calendar day stable across timezones.
  created_at: '2026-08-18T12:00:00.000Z',
  description: 'Ração da Girassol',
  amount: -50,
  amount_formatted: -50,
  currency: brl,
  type: 'DEBIT',
  account: {
    id: 13,
    name: 'Nubank CC',
    type: 'BANK',
    currency: brl,
    balance: 0,
    initialAmount: null,
  },
  category: {
    id: '80c01d32-c39c-4c65-aa14-99db01a061d5',
    name: 'Animais de estimação',
    icon: { id: 'icon-1', name: 'paw-print' },
    color: { id: 'color-1', color_code: '#000000' },
  },
  tags: [],
  user_id: 'user-1',
  ...overrides,
});

const selectedDate = new Date(2026, 7, 15); // August 2026

const quotes = {
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
};


describe('processTransactions', () => {
  // AC1 — raw API (ISO 8601) created_at must be grouped, day title dd/MM/yyyy
  it('groups an ISO-timestamp transaction of the selected month with a dd/MM/yyyy day title', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction()],
      'months',
      selectedDate,
      quotes
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('18/08/2026');
    expect(groupedTransactions[0].data).toHaveLength(1);
    expect(groupedTransactions[0].data[0].id).toBe(9);
    expect(groupedTransactions[0].data[0].created_at).toBe('18/08/2026');
  });

  // AC2 — dd/MM/yyyy pre-formatted input keeps working identically
  it('groups a dd/MM/yyyy pre-formatted transaction identically (backward compat)', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '18/08/2026' })],
      'months',
      selectedDate,
      quotes
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('18/08/2026');
    expect(groupedTransactions[0].data).toHaveLength(1);
  });

  // AC1 — period filtering still excludes out-of-period transactions
  it('excludes transactions outside the selected month', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '2026-07-31T12:00:00.000Z' })],
      'months',
      selectedDate,
      quotes
    );

    expect(groupedTransactions).toHaveLength(0);
  });

  // R3 — period "all" accepts ISO timestamps too
  it('includes ISO transactions when the period is "all"', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '2025-01-05T12:00:00.000Z' })],
      'all',
      selectedDate,
      quotes
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('05/01/2025');
  });

  it('drops transactions with an unparseable created_at', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: 'not-a-date' })],
      'months',
      selectedDate,
      quotes
    );

    expect(groupedTransactions).toHaveLength(0);
  });

  // WEEK-02 — weeks mode filters to the selected ISO week and groups by day
  it('includes only transactions of the selected ISO week, grouped by day', () => {
    const { groupedTransactions } = processTransactions(
      [
        makeTransaction({ id: 1, created_at: '2026-08-10T12:00:00.000Z' }), // Monday, ISO week 33
        makeTransaction({ id: 2, created_at: '2026-08-17T12:00:00.000Z' }), // Monday, ISO week 34
      ],
      'weeks',
      selectedDate, // Saturday of ISO week 33
      quotes
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('10/08/2026');
    expect(groupedTransactions[0].data).toHaveLength(1);
    expect(groupedTransactions[0].data[0].id).toBe(1);
    expect(groupedTransactions[0].data[0].created_at).toBe('10/08/2026');
  });

  // WEEK-07 — one bar-pair per ISO week with transactions, labeled Sem N \n YYYY, chronological
  it('emits one chart bar-pair per ISO week with transactions, oldest first', () => {
    const { cashFlowChartData } = processTransactions(
      [
        makeTransaction({ id: 1, amount: -50, created_at: '2026-08-10T12:00:00.000Z' }), // ISO week 33
        makeTransaction({ id: 2, amount: -30, created_at: '2026-08-17T12:00:00.000Z' }), // ISO week 34
      ],
      'weeks',
      selectedDate
    );

    expect(cashFlowChartData).toHaveLength(4); // 2 weeks * (revenue + expense) bars
    expect(cashFlowChartData[0].label).toBe('Sem 33 \n 2026');
    expect(cashFlowChartData[1].value).toBe(50); // week 33 expense bar
    expect(cashFlowChartData[2].label).toBe('Sem 34 \n 2026');
    expect(cashFlowChartData[3].value).toBe(30); // week 34 expense bar
  });

  // WEEK-07 — currentCashFlow covers the selected ISO week only
  it('computes currentCashFlow from the selected ISO week only', () => {
    const { currentCashFlow } = processTransactions(
      [
        makeTransaction({ id: 1, amount: -50, created_at: '2026-08-10T12:00:00.000Z' }), // ISO week 33 (selected)
        makeTransaction({ id: 2, amount: -30, created_at: '2026-08-17T12:00:00.000Z' }), // ISO week 34
      ],
      'weeks',
      selectedDate
    );

    expect(currentCashFlow).toBe('-R$\u00A050,00');
  });

  // WEEK-02 — a transaction with the same ISO week number in a different ISO week-year is excluded
  it('excludes a transaction with the same ISO week number in a different ISO week-year', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '2025-08-11T12:00:00.000Z' })], // ISO week 33 of 2025
      'weeks',
      selectedDate, // ISO week 33 of 2026
      quotes
    );

    expect(groupedTransactions).toHaveLength(0);
  });

  // Edge case — ISO week-year differs from calendar year (2025-12-29 is ISO week 1 of 2026)
  it('groups a year-boundary transaction under its ISO week-year label', () => {
    const { cashFlows, groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '2025-12-29T12:00:00.000Z' })], // Monday, ISO week 1 of 2026
      'weeks',
      new Date(2025, 11, 29),
      quotes
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(cashFlows.map((cashFlow) => cashFlow.date)).toEqual(['Sem 1 \n 2026']);
  });

  // BC-16 — cash flow and day totals format in the selected base currency
  it('formats the current cash flow and day totals in the base currency', () => {
    const { currentCashFlow, currentCashFlowValue, groupedTransactions } =
      processTransactions(
        [makeTransaction()],
        'months',
        selectedDate,
        quotes,
        'USD'
      );

    // -50 BRL x 0.2 (brlQuoteUsd) = -10 USD (BC-21)
    expect(currentCashFlow).toBe('-US$\u00A010,00');
    expect(currentCashFlowValue).toBe(-10);
    expect(groupedTransactions[0].total).toBe('-US$\u00A010,00');
  });

  // BC-19 — the raw current cash flow is the exact numeric sum (cents
  // included), never a re-parsed formatted string
  it('exposes the exact raw current cash flow value', () => {
    const { currentCashFlowValue, currentCashFlow } = processTransactions(
      [
        makeTransaction({ id: 1, amount: -50.5 }),
        makeTransaction({ id: 2, amount: 25.25 }),
      ],
      'months',
      selectedDate,
      quotes,
      'USD'
    );

    // (-50.5 + 25.25) BRL x 0.2 = -5.05 USD (BC-21)
    expect(currentCashFlowValue).toBeCloseTo(-5.05, 10);
    expect(currentCashFlow).toBe('-US$\u00A05,05');
  });

  // BC-21 — mixed account currencies convert per amount before summing
  it('converts mixed-currency amounts per amount into the base currency', () => {
    const usdAccount = {
      ...makeTransaction({
        id: 2,
        amount: 20,
        type: 'CREDIT' as const,
        currency: usd,
        account: {
          id: 14,
          name: 'Conta USD',
          type: 'BANK' as const,
          currency: usd,
          balance: 0,
          initialAmount: null,
        },
      }),
    };

    const { currentCashFlowValue, currentCashFlow } = processTransactions(
      [makeTransaction({ amount: 100 }), usdAccount],
      'months',
      selectedDate,
      quotes,
      'USD'
    );

    // 100 BRL x 0.2 = 20 USD; 20 USD stays 20 USD (BC-24)
    expect(currentCashFlowValue).toBe(40);
    expect(currentCashFlow).toBe('US$\u00A040,00');
  });

  // BC-21 — the cash flow chart bars aggregate converted amounts
  it('converts the chart bar values to the base currency', () => {
    const { cashFlowChartData } = processTransactions(
      [
        makeTransaction({ id: 1, amount: -50 }), // DEBIT -> expense
        makeTransaction({ id: 2, amount: 100, type: 'CREDIT' }),
      ],
      'months',
      selectedDate,
      quotes,
      'USD'
    );

    // revenue 100 BRL x 0.2 = 20 USD; expense 50 BRL x 0.2 = 10 USD
    expect(cashFlowChartData[0].value).toBe(20);
    expect(cashFlowChartData[1].value).toBe(10);
  });

  // BC-22 — the cash-flow loop prefers amount_in_account_currency (the
  // account-currency value) over the transaction-currency amount
  it('uses amount_in_account_currency in the cash flow conversion', () => {
    const { currentCashFlowValue, currentCashFlow } = processTransactions(
      [
        makeTransaction({
          id: 1,
          amount: 100,
          currency: usd,
          amount_in_account_currency: 50,
        }),
      ],
      'months',
      selectedDate,
      quotes,
      'USD'
    );

    // 50 BRL (the account-currency value) x 0.2 = 10 USD, not 100 USD
    expect(currentCashFlowValue).toBe(10);
    expect(currentCashFlow).toBe('US$\u00A010,00');
  });

  // BC-23 — unsupported account currencies are skipped from every aggregate
  it('skips unsupported account currencies from the cash flow and day total', () => {
    const ethAccountTx = makeTransaction({
      id: 2,
      amount: 7,
      currency: eth,
      account: {
        id: 15,
        name: 'Carteira ETH',
        type: 'WALLET',
        currency: eth,
        balance: 0,
        initialAmount: null,
      },
    });

    const { currentCashFlowValue, groupedTransactions, cashFlowChartData } =
      processTransactions(
        [makeTransaction({ amount: -50 }), ethAccountTx],
        'months',
        selectedDate,
        quotes,
        'USD'
      );

    // only the -50 BRL tx converts: -10 USD; the ETH tx contributes nothing
    expect(currentCashFlowValue).toBe(-10);
    expect(groupedTransactions[0].rawTotal).toBe(-10);
    expect(cashFlowChartData[1].value).toBe(10);
    // the ETH row still renders in the day group (BC-23 skips the amount)
    expect(groupedTransactions[0].data).toHaveLength(2);
  });
});
