import { endOfMonth } from 'date-fns';

import {
  formatBudgetInfo,
  getBudgetPeriods,
  getTransactionSpentAmount,
} from '../budgetCalculations';

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

// Local-noon timestamps (no Z suffix) keep the local calendar day stable
// across timezones, including UTC+13/+14.
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

describe('getBudgetPeriods', () => {
  it('returns one period per month, ending on the last day of each month, up to and including the current period', () => {
    const periods = getBudgetPeriods(
      { start_date: '2026-01-15T12:00:00', recurrence: 'MONTHLY' },
      new Date(2026, 3, 10) // April 10, 2026
    );

    expect(periods).toHaveLength(4);

    // The first period runs from the budget start to the end of its month.
    expect(periods[0].startDate.getTime()).toBe(
      new Date(2026, 0, 15, 12).getTime()
    );
    expect(periods[0].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 0, 15)).getTime()
    );

    // Later periods are full calendar months starting at 00:00 on the 1st,
    // so no transaction instant falls between two consecutive periods.
    expect(periods[1].startDate.getTime()).toBe(
      new Date(2026, 1, 1).getTime()
    );
    expect(periods[1].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 1, 1)).getTime()
    );

    expect(periods[2].startDate.getTime()).toBe(
      new Date(2026, 2, 1).getTime()
    );
    expect(periods[2].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 2, 1)).getTime()
    );

    // The in-progress period is included and its end is >= upTo.
    expect(periods[3].startDate.getTime()).toBe(
      new Date(2026, 3, 1).getTime()
    );
    expect(periods[3].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 3, 1)).getTime()
    );
    expect(periods[3].endDate.getTime()).toBeGreaterThanOrEqual(
      new Date(2026, 3, 10).getTime()
    );
  });

  it('leaves no gap or overlap between consecutive monthly periods', () => {
    // Budget created at 19:03 on the 1st — mirrors the production case where
    // the gap covered the 1st until the budget's start time-of-day.
    const upTo = new Date(2026, 9, 1, 12); // October 1, 2026, noon
    const periods = getBudgetPeriods(
      { start_date: '2026-01-01T19:03:00', recurrence: 'MONTHLY' },
      upTo
    );

    expect(periods).toHaveLength(10); // January through October

    for (let i = 1; i < periods.length; i += 1) {
      expect(
        periods[i].startDate.getTime() - periods[i - 1].endDate.getTime()
      ).toBe(1); // exactly 1 ms apart: no gap, no overlap
    }

    // The current period contains upTo even on the 1st, before the budget's
    // original start time-of-day.
    const current = periods[periods.length - 1];
    expect(current.startDate.getTime()).toBeLessThanOrEqual(upTo.getTime());
    expect(current.endDate.getTime()).toBeGreaterThanOrEqual(upTo.getTime());
  });

  it('steps daily periods by one day', () => {
    const periods = getBudgetPeriods(
      { start_date: '2026-08-01T12:00:00', recurrence: 'DAILY' },
      new Date(2026, 7, 4, 12)
    );

    expect(periods).toHaveLength(3);
    expect(periods[0].startDate.getTime()).toBe(
      new Date(2026, 7, 1, 12).getTime()
    );
    expect(periods[0].endDate.getTime()).toBe(
      new Date(2026, 7, 2, 12).getTime()
    );
    expect(periods[2].endDate.getTime()).toBe(
      new Date(2026, 7, 4, 12).getTime()
    );
  });

  it('steps weekly periods by one week', () => {
    const periods = getBudgetPeriods(
      { start_date: '2026-06-01T12:00:00', recurrence: 'WEEKLY' },
      new Date(2026, 5, 20)
    );

    expect(periods).toHaveLength(3);
    expect(periods[2].startDate.getTime()).toBe(
      new Date(2026, 5, 15, 12).getTime()
    );
    expect(periods[2].endDate.getTime()).toBe(
      new Date(2026, 5, 22, 12).getTime()
    );
  });

  it('steps biweekly periods by 15 days', () => {
    const periods = getBudgetPeriods(
      { start_date: '2026-01-01T12:00:00', recurrence: 'BIWEEKLY' },
      new Date(2026, 0, 20)
    );

    expect(periods).toHaveLength(2);
    expect(periods[1].startDate.getTime()).toBe(
      new Date(2026, 0, 16, 12).getTime()
    );
    expect(periods[1].endDate.getTime()).toBe(
      new Date(2026, 0, 31, 12).getTime()
    );
  });

  it('steps semiannually and annually', () => {
    const semiannual = getBudgetPeriods(
      { start_date: '2026-01-10T12:00:00', recurrence: 'SEMIANNUALLY' },
      new Date(2026, 7, 1)
    );
    expect(semiannual).toHaveLength(2);
    expect(semiannual[1].endDate.getTime()).toBe(
      new Date(2027, 0, 10, 12).getTime()
    );

    const annual = getBudgetPeriods(
      { start_date: '2026-03-05T12:00:00', recurrence: 'ANNUALLY' },
      new Date(2026, 3, 1)
    );
    expect(annual).toHaveLength(1);
    expect(annual[0].endDate.getTime()).toBe(
      new Date(2027, 2, 5, 12).getTime()
    );
  });

  it('returns a single period when the budget starts in the future', () => {
    const periods = getBudgetPeriods(
      { start_date: '2026-12-01T12:00:00', recurrence: 'MONTHLY' },
      new Date(2026, 7, 1)
    );

    expect(periods).toHaveLength(1);
    expect(periods[0].endDate.getTime()).toBe(
      endOfMonth(new Date(2026, 11, 1)).getTime()
    );
  });

  it('does not hang on an unknown recurrence', () => {
    const periods = getBudgetPeriods(
      { start_date: '2026-01-15T12:00:00', recurrence: 'QUARTERLY' },
      new Date(2026, 7, 1)
    );

    expect(periods).toHaveLength(1);
  });
});

describe('getTransactionSpentAmount', () => {
  it('returns the negated amount for non-credit accounts (spending sign convention)', () => {
    expect(
      getTransactionSpentAmount(makeTransaction({ amount: -50 }))
    ).toBe(50);
  });

  it('returns the amount as-is for credit-card accounts', () => {
    expect(
      getTransactionSpentAmount(
        makeTransaction({ account: creditCardAccount, amount: -50 })
      )
    ).toBe(-50);
  });

  it('returns 0 for transfers', () => {
    expect(
      getTransactionSpentAmount(makeTransaction({ type: 'TRANSFER_CREDIT' }))
    ).toBe(0);
    expect(
      getTransactionSpentAmount(makeTransaction({ type: 'TRANSFER_DEBIT' }))
    ).toBe(0);
  });

  it('uses amount_in_account_currency for foreign-currency transactions', () => {
    expect(
      getTransactionSpentAmount(
        makeTransaction({
          currency: usd,
          amount: -10,
          amount_in_account_currency: -55,
        })
      )
    ).toBe(55);
  });
});

describe('formatBudgetInfo', () => {
  const upTo = new Date(2026, 7, 10); // August 10, 2026

  it('computes the current period and amount spent identically after the shared-helper extraction', () => {
    const budget = makeBudget();

    const inAugustPeriod = makeTransaction({
      id: 1,
      created_at: '2026-08-18T12:00:00',
      amount: -100,
    });
    const previousPeriod = makeTransaction({
      id: 2,
      created_at: '2026-07-20T12:00:00',
      amount: -500,
    });
    const transferInAugust = makeTransaction({
      id: 3,
      created_at: '2026-08-21T12:00:00',
      type: 'TRANSFER_DEBIT',
      amount: -25,
    });
    const anotherInAugust = makeTransaction({
      id: 4,
      created_at: '2026-08-22T12:00:00',
      amount: -50,
    });
    const foreignCurrencyInAugust = makeTransaction({
      id: 5,
      created_at: '2026-08-23T12:00:00',
      currency: usd,
      amount: -10,
      amount_in_account_currency: -55,
    });
    const otherCategoryInAugust = makeTransaction({
      id: 6,
      created_at: '2026-08-24T12:00:00',
      category: foodCategory,
      amount: -999,
    });
    const exactlyOnPeriodStart = makeTransaction({
      id: 7,
      created_at: '2026-08-15T12:00:00',
      amount: -10,
    });

    const result = formatBudgetInfo(
      budget,
      [
        inAugustPeriod,
        previousPeriod,
        transferInAugust,
        anotherInAugust,
        foreignCurrencyInAugust,
        otherCategoryInAugust,
        exactlyOnPeriodStart,
      ],
      upTo
    );

    // Current monthly period is [Aug 1, Aug 31] (full calendar month).
    expect(result.current_start_date.getTime()).toBe(
      new Date(2026, 7, 1).getTime()
    );
    expect(result.current_end_date.getTime()).toBe(
      endOfMonth(new Date(2026, 7, 1)).getTime()
    );

    // 100 + 50 + 55 + 10 = 215 (transfer and out-of-period/out-of-category excluded)
    expect(result.amount_spent).toBe(215);
    expect(result.percentage).toBe(21.5);

    // Transfers stay in the transaction list even though they don't count.
    expect(result.budget_transactions).toHaveLength(5);
    expect(
      result.budget_transactions.map((transaction) => transaction.id)
    ).toEqual([1, 3, 4, 5, 7]);
  });

  it('counts transactions created on the 1st of the month before the budget start time-of-day', () => {
    // Production case: budget created at 19:03 on Aug 1. On Sep 1 morning the
    // budget showed 0 spent and no transactions because the September period
    // only started at 19:03 on the 1st.
    const budget = makeBudget({ start_date: '2026-08-01T19:03:00' });
    const septemberUpTo = new Date(2026, 8, 2); // September 2, 2026

    const onTheFirst = makeTransaction({
      id: 21,
      created_at: '2026-09-01T09:15:00',
      amount: -80,
    });

    const result = formatBudgetInfo(budget, [onTheFirst], septemberUpTo);

    expect(result.current_start_date.getTime()).toBe(
      new Date(2026, 8, 1).getTime()
    );
    expect(result.current_end_date.getTime()).toBe(
      endOfMonth(new Date(2026, 8, 1)).getTime()
    );
    expect(result.budget_transactions.map((t) => t.id)).toEqual([21]);
    expect(result.amount_spent).toBe(80);
    expect(result.percentage).toBe(8);
  });
});
