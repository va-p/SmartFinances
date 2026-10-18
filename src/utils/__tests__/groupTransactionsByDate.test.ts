import groupTransactionsByDate from '../groupTransactionsByDate';

import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;
const usd = { id: 5, name: 'US Dollar', code: 'USD', symbol: '$' } as const;
const eth = { id: 4, name: 'Ethereum', code: 'ETH', symbol: 'Ξ' } as const;

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

const zeroQuotes = {
  brlQuoteBtc: { price: 0 },
  brlQuoteEur: { price: 0 },
  brlQuoteUsd: { price: 0 },
  btcQuoteBrl: { price: 0 },
  btcQuoteEur: { price: 0 },
  btcQuoteUsd: { price: 0 },
  eurQuoteBrl: { price: 0 },
  eurQuoteBtc: { price: 0 },
  eurQuoteUsd: { price: 0 },
  usdQuoteBrl: { price: 0 },
  usdQuoteBtc: { price: 0 },
  usdQuoteEur: { price: 0 },
};

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 9,
  created_at: '18/08/2026',
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

const usdAccountTransaction = (amount: number) =>
  makeTransaction({
    amount,
    currency: usd,
    account: {
      id: 14,
      name: 'Conta USD',
      type: 'BANK',
      currency: usd,
      balance: 0,
      initialAmount: null,
    },
  });

const ethAccountTransaction = (amount: number) =>
  makeTransaction({
    amount,
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

describe('groupTransactionsByDate', () => {
  // BC-16 (default) — day totals default to the BRL display currency
  it('formats the day total in BRL by default', () => {
    const [group] = groupTransactionsByDate([makeTransaction()], quotes);

    expect(group.total).toBe('-R$\u00A050,00');
    expect(group.rawTotal).toBe(-50);
  });

  // BC-16 — day totals format in the selected base currency
  it('formats the day total in the base currency', () => {
    const [group] = groupTransactionsByDate([makeTransaction()], quotes, 'USD');

    expect(group.total).toBe('-US$\u00A010,00');
    expect(group.rawTotal).toBe(-10);
  });

  // BC-21 — each amount is converted to the base currency BEFORE summing:
  // +100 BRL and -30 BRL with base USD (brlQuoteUsd 0.2) -> 14 USD
  it('converts each amount to the base currency before summing', () => {
    const [group] = groupTransactionsByDate(
      [makeTransaction({ amount: 100 }), makeTransaction({ amount: -30 })],
      quotes,
      'USD'
    );

    expect(group.rawTotal).toBe(14);
    expect(group.total).toBe('US$\u00A014,00');
  });

  // BC-21 — mixed account currencies convert per amount, not per day
  it('sums mixed-currency days per converted amount', () => {
    const [group] = groupTransactionsByDate(
      [makeTransaction({ amount: 100 }), usdAccountTransaction(20)],
      quotes
    );

    // 100 BRL stays 100 BRL; 20 USD x 5 (usdQuoteBrl) = 100 BRL
    expect(group.rawTotal).toBe(200);
    expect(group.total).toBe('R$\u00A0200,00');
  });

  // BC-22 — amount_in_account_currency (account-currency value) wins over
  // the transaction-currency amount
  it('uses amount_in_account_currency when present', () => {
    const [group] = groupTransactionsByDate(
      [
        makeTransaction({
          amount: 100,
          currency: usd,
          amount_in_account_currency: 50,
        }),
      ],
      quotes
    );

    // 50 BRL (the account-currency value), not 100 USD
    expect(group.rawTotal).toBe(50);
    expect(group.total).toBe('R$\u00A050,00');
  });

  // BC-24 — same-currency (account = base) sums never touch the quotes:
  // all-zero quotes keep the exact value
  it('passes same-currency amounts through with zero-price quotes', () => {
    const [group] = groupTransactionsByDate(
      [makeTransaction({ amount: -50 })],
      zeroQuotes
    );

    expect(group.rawTotal).toBe(-50);
    expect(group.total).toBe('-R$\u00A050,00');
  });

  // BC-23 — unsupported account currencies are skipped from the total
  it('skips unsupported account currencies from the day total', () => {
    const [group] = groupTransactionsByDate(
      [makeTransaction({ amount: 100 }), ethAccountTransaction(7)],
      quotes
    );

    expect(group.rawTotal).toBe(100);
    expect(group.total).toBe('R$\u00A0100,00');
    // the row itself still renders in the group
    expect(group.data).toHaveLength(2);
  });

  // BC-19 — the raw total is the exact numeric sum (cents included), never a
  // re-parsed formatted string (identity path: account currency = base)
  it('keeps the exact fractional raw total', () => {
    const [group] = groupTransactionsByDate(
      [makeTransaction({ amount: 100 }), makeTransaction({ amount: -30.5 })],
      quotes
    );

    expect(group.rawTotal).toBe(69.5);
    expect(group.total).toBe('R$\u00A069,50');
  });

  it('sums same-day transactions into one group with one total', () => {
    const groups = groupTransactionsByDate(
      [
        makeTransaction({ id: 1, amount: 100 }),
        makeTransaction({ id: 2, amount: -30.5 }),
        makeTransaction({ id: 3, created_at: '19/08/2026', amount: 10 }),
      ],
      quotes
    );

    expect(groups).toHaveLength(2);
    expect(groups[0].title).toBe('18/08/2026');
    expect(groups[0].data).toHaveLength(2);
    expect(groups[0].rawTotal).toBe(69.5);
    expect(groups[1].rawTotal).toBe(10);
  });
});
