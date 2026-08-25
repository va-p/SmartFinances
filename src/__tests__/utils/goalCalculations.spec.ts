import { computeGoalProgress } from '@utils/goalCalculations';
import formatCurrency from '@utils/formatCurrency';
import { CurrencyCodes } from '@interfaces/currencies';
import { GoalProps } from '@interfaces/goals';

/**
 * Spec-anchored tests for computeGoalProgress
 * (spec.md GOAL-02 current amount, GOAL-19 "Meta atingida" at >= 100%,
 * GOAL-29 progress recompute vs target; design.md §goalCalculations).
 */

const quotes = {
  brlQuoteBtc: { price: 0.000001 },
  brlQuoteEur: { price: 0.18 },
  brlQuoteUsd: { price: 0.2 },
  btcQuoteBrl: { price: 500000 },
  btcQuoteEur: { price: 90000 },
  btcQuoteUsd: { price: 100000 },
  eurQuoteBrl: { price: 6 },
  eurQuoteBtc: { price: 0.00001 },
  eurQuoteUsd: { price: 0.9 },
  usdQuoteBrl: { price: 5 },
  usdQuoteBtc: { price: 0.00001 },
  usdQuoteEur: { price: 1.1 },
};

const buildGoal = (overrides: Partial<GoalProps> = {}): GoalProps => ({
  id: 'goal-1',
  name: 'Viagem',
  target_amount: '1000',
  status: 'ACTIVE',
  deadline: null,
  completed_at: null,
  currency: { id: 1, code: 'BRL', symbol: 'R$' },
  reserve_account: {
    id: 99,
    name: 'Reserva: Viagem',
    balance: 0,
    is_virtual: true,
    currency_id: 1,
  },
  linked_accounts: [],
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
  ...overrides,
});

const linkedAccount = (
  id: number,
  balance: number,
  code: CurrencyCodes
): GoalProps['linked_accounts'][number] => ({
  id,
  name: `Account ${id}`,
  balance,
  currency: { id, code, symbol: code },
  type: 'BANK',
});

describe('computeGoalProgress', () => {
  it('GOAL-02: sums reserve and same-currency linked balances', () => {
    const goal = buildGoal({
      reserve_account: { ...buildGoal().reserve_account, balance: 500 },
      linked_accounts: [linkedAccount(10, 300, 'BRL')],
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.currentAmount).toBe(800);
    expect(progress.percentage).toBe(80);
    expect(progress.isAmountReached).toBe(false);
  });

  it('GOAL-02: converts linked balances in other currencies into the goal currency', () => {
    // 100 USD @ 5 BRL/USD = 500 BRL + 500 reserve = 1000 of 2000 target
    const goal = buildGoal({
      target_amount: '2000',
      reserve_account: { ...buildGoal().reserve_account, balance: 500 },
      linked_accounts: [linkedAccount(10, 100, 'USD')],
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.currentAmount).toBe(1000);
    expect(progress.percentage).toBe(50);
    expect(progress.isAmountReached).toBe(false);
  });

  it('GOAL-02: converts when the goal currency is not BRL', () => {
    // Goal in USD: 250 BRL @ 0.2 USD/BRL = 50 USD of 100 target
    const goal = buildGoal({
      target_amount: '100',
      currency: { id: 2, code: 'USD', symbol: '$' },
      linked_accounts: [linkedAccount(10, 250, 'BRL')],
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.currentAmount).toBe(50);
    expect(progress.percentage).toBe(50);
  });

  it('reports 0% when the reserve is zero and no accounts are linked', () => {
    const progress = computeGoalProgress(buildGoal(), quotes);

    expect(progress.currentAmount).toBe(0);
    expect(progress.percentage).toBe(0);
    expect(progress.isAmountReached).toBe(false);
  });

  it('GOAL-19: exactly 100% marks the goal as reached', () => {
    const goal = buildGoal({
      reserve_account: { ...buildGoal().reserve_account, balance: 1000 },
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.percentage).toBe(100);
    expect(progress.isAmountReached).toBe(true);
  });

  it('GOAL-19/29: above 100% keeps the reached flag with the real percentage', () => {
    const goal = buildGoal({
      reserve_account: { ...buildGoal().reserve_account, balance: 1500 },
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.percentage).toBe(150);
    expect(progress.isAmountReached).toBe(true);
  });

  it('counts only the reserve when the goal has zero linked accounts', () => {
    const goal = buildGoal({
      reserve_account: { ...buildGoal().reserve_account, balance: 250 },
      linked_accounts: [],
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.currentAmount).toBe(250);
    expect(progress.percentage).toBe(25);
  });

  it('currentFormatted formats the current amount in the goal currency', () => {
    const goal = buildGoal({
      reserve_account: { ...buildGoal().reserve_account, balance: 800 },
    });

    const progress = computeGoalProgress(goal, quotes);

    expect(progress.currentFormatted).toBe(formatCurrency('BRL', 800));
    expect(progress.currentFormatted).toContain('R$');
  });
});
