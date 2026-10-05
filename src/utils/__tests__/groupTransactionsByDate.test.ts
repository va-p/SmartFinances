import groupTransactionsByDate from '../groupTransactionsByDate';

import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;

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

describe('groupTransactionsByDate', () => {
  // BC-16 (default) — day totals default to the BRL display currency
  it('formats the day total in BRL by default', () => {
    const [group] = groupTransactionsByDate([makeTransaction()]);

    expect(group.total).toBe('-R$\u00A050,00');
    expect(group.rawTotal).toBe(-50);
  });

  // BC-16 — day totals format in the selected base currency
  it('formats the day total in the base currency', () => {
    const [group] = groupTransactionsByDate([makeTransaction()], 'USD');

    expect(group.total).toBe('-US$\u00A050,00');
    expect(group.rawTotal).toBe(-50);
  });

  // BC-19 — the raw total is the exact numeric sum (cents included), never a
  // re-parsed formatted string
  it('keeps the exact fractional raw total', () => {
    const [group] = groupTransactionsByDate(
      [
        makeTransaction({ amount: 100 }),
        makeTransaction({ amount: -30.5 }),
      ],
      'USD'
    );

    expect(group.rawTotal).toBe(69.5);
    expect(group.total).toBe('US$\u00A069,50');
  });

  it('sums same-day transactions into one group with one total', () => {
    const groups = groupTransactionsByDate([
      makeTransaction({ id: 1, amount: 100 }),
      makeTransaction({ id: 2, amount: -30.5 }),
      makeTransaction({ id: 3, created_at: '19/08/2026', amount: 10 }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].title).toBe('18/08/2026');
    expect(groups[0].data).toHaveLength(2);
    expect(groups[0].rawTotal).toBe(69.5);
    expect(groups[1].rawTotal).toBe(10);
  });
});
