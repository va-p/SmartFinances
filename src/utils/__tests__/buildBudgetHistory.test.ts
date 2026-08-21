import { endOfMonth } from 'date-fns';

import {
  buildBudgetHistory,
  formatBudgetHistoryLabel,
  getAverageBudgetSpending,
} from '../buildBudgetHistory';

import { BudgetProps } from '../../interfaces/budget';
import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;
const usd = { id: 2, name: 'US Dollar', code: 'USD', symbol: '$' } as const;

const bankAccount = {
  id: 13,
  name: 'Nubank',
  type: 'BANK',
  currency: brl,
  balance: 0,
  initialAmount: null,
} as const;

const creditCardAccount = {
  id: 14,
  name: 'Cartão de crédito',
  type: 'CREDIT',
  currency: brl,
  balance: 0,
  initialAmount: null,
} as const;

const petCategory = {
  id: '80c01d32-c39c-4c65-aa14-99db01a061d5',
  name: 'Animais de estimação',
  icon: { id: 'icon-1', name: 'paw-print' },
  color: { id: 'color-1', color_code: '#000000' },
} as const;

const foodCategory = {
  id: '7f9a0b21-b11a-4aab-9cc0-0f5d32b7c001',
  name: 'Alimentação',
  icon: { id: 'icon-2', name: 'fork-knife' },
  color: { id: 'color-2', color_code: '#111111' },
} as const;

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 9,
  created_at: '2026-08-18T12:00:00',
  description: 'Ração da Girassol',
  amount: -50,
  amount_formatted: -50,
  currency: brl,
  type: 'DEBIT',
  account: bankAccount,
  category: petCategory,
  tags: [],
  user_id: 'user-1',
  ...overrides,
});

const makeBudget = (overrides: Partial<BudgetProps> = {}): BudgetProps => ({
  id: 'budget-1',
  name: 'Orçamento mensal',
  amount: 1000,
  amount_spent: 0,
  percentage: 0,
  currency: brl,
  account: bankAccount,
  categories: [
    { ...petCategory, category_id: petCategory.id },
  ] as unknown as BudgetProps['categories'],
  start_date: '2026-01-15T12:00:00',
  end_date: null,
  recurrence: 'MONTHLY',
  user_id: 'user-1',
  transactions: [],
  ...overrides,
});

const upTo = new Date(2026, 3, 10); // April 10, 2026

describe('buildBudgetHistory', () => {
  it('returns one entry per period from budget start through the current period', () => {
    const history = buildBudgetHistory(makeBudget(), [], upTo);

    expect(history).toHaveLength(4);

    expect(history[0].startDate.getTime()).toBe(
      new Date(2026, 0, 15, 12).getTime()
    );
    expect(history[0].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 0, 15)).getTime()
    );
    expect(history[3].startDate.getTime()).toBe(
      new Date(2026, 3, 15, 12).getTime()
    );
    expect(history[3].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 3, 15)).getTime()
    );
  });

  it('assigns each transaction to the period containing its date', () => {
    const januarySpending = makeTransaction({
      id: 1,
      created_at: '2026-01-18T12:00:00',
      amount: -100,
    });
    const februarySpending = makeTransaction({
      id: 2,
      created_at: '2026-02-16T12:00:00',
      amount: -50,
    });
    const aprilSpending = makeTransaction({
      id: 4,
      created_at: '2026-04-16T12:00:00',
      amount: -25,
    });

    const history = buildBudgetHistory(
      makeBudget(),
      [januarySpending, februarySpending, aprilSpending],
      upTo
    );

    expect(history.map((period) => period.amountSpent)).toEqual([
      100, 50, 0, 25,
    ]);
  });

  it('excludes transfers, other-category and out-of-range transactions', () => {
    const marchTransfer = makeTransaction({
      id: 3,
      created_at: '2026-03-20T12:00:00',
      type: 'TRANSFER_DEBIT',
      amount: -200,
    });
    const otherCategory = makeTransaction({
      id: 5,
      created_at: '2026-02-12T12:00:00',
      category: foodCategory,
      amount: -999,
    });
    const beforeBudgetStart = makeTransaction({
      id: 6,
      created_at: '2026-01-10T12:00:00',
      amount: -777,
    });

    const history = buildBudgetHistory(
      makeBudget(),
      [marchTransfer, otherCategory, beforeBudgetStart],
      upTo
    );

    expect(history.every((period) => period.amountSpent === 0)).toBe(true);
  });

  it('applies the same amount rules as formatBudgetInfo (credit account and foreign currency)', () => {
    const creditCardPurchase = makeTransaction({
      id: 7,
      created_at: '2026-02-16T12:00:00',
      account: creditCardAccount,
      amount: -30,
    });
    const foreignCurrency = makeTransaction({
      id: 8,
      created_at: '2026-02-17T12:00:00',
      currency: usd,
      amount: -10,
      amount_in_account_currency: -55,
    });

    const history = buildBudgetHistory(
      makeBudget(),
      [creditCardPurchase, foreignCurrency],
      upTo
    );

    // February: credit card (-30 as-is) + foreign currency (+55 negated) = 25
    expect(history[1].amountSpent).toBe(25);
  });

  it('does not mutate its inputs', () => {
    const budget = makeBudget();
    const transaction = makeTransaction({ amount: -100 });
    const budgetBefore = JSON.stringify(budget);
    const transactionBefore = JSON.stringify(transaction);

    buildBudgetHistory(budget, [transaction], upTo);

    expect(JSON.stringify(budget)).toBe(budgetBefore);
    expect(JSON.stringify(transaction)).toBe(transactionBefore);
  });
});

describe('formatBudgetHistoryLabel', () => {
  it('formats the period start as uppercase pt-BR month + 2-digit year', () => {
    expect(formatBudgetHistoryLabel(new Date(2026, 5, 1))).toBe('JUN 26');
    expect(formatBudgetHistoryLabel(new Date(2026, 11, 15))).toBe('DEZ 26');
    expect(formatBudgetHistoryLabel(new Date(2027, 0, 10))).toBe('JAN 27');
    expect(formatBudgetHistoryLabel(new Date(2026, 4, 20))).toBe('MAI 26');
  });
});

describe('getAverageBudgetSpending', () => {
  it('returns the mean of the displayed periods', () => {
    const history = [
      { startDate: new Date(), endDate: new Date(), amountSpent: 100 },
      { startDate: new Date(), endDate: new Date(), amountSpent: 20 },
      { startDate: new Date(), endDate: new Date(), amountSpent: 0 },
      { startDate: new Date(), endDate: new Date(), amountSpent: 25 },
    ];

    expect(getAverageBudgetSpending(history)).toBe(36.25);
  });

  it('returns 0 for an empty history', () => {
    expect(getAverageBudgetSpending([])).toBe(0);
  });
});
