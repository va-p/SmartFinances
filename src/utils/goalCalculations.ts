import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import { GoalProps } from '@interfaces/goals';

type Quotes = Parameters<typeof convertCurrency>[0]['quotes'];

export type GoalProgress = {
  currentAmount: number;
  currentFormatted: string;
  percentage: number;
  isAmountReached: boolean;
};

/**
 * Goal progress (GOAL-02/19/29): the current amount is the virtual reserve
 * balance (always held in the goal currency) plus every linked account
 * balance converted into the goal currency with the current quotes.
 * `isAmountReached` drives the "Meta atingida" state at >= 100% of the
 * target. Number arithmetic mirrors budgetCalculations.ts.
 */
export function computeGoalProgress(
  goal: GoalProps,
  quotes: Quotes
): GoalProgress {
  const goalCurrencyCode = goal.currency.code;

  let currentAmount = Number(goal?.reserve_account?.balance ?? 0);

  for (const account of goal?.linked_accounts ?? []) {
    if (account.currency.code === goalCurrencyCode) {
      currentAmount += Number(account.balance);
      continue;
    }

    currentAmount += convertCurrency({
      amount: Number(account.balance),
      fromCurrency: account.currency.code,
      toCurrency: goalCurrencyCode,
      // `accountCurrency` equal to `fromCurrency` disables convertCurrency's
      // internal double-conversion step (see @utils/transactionPayload).
      accountCurrency: account.currency.code,
      quotes,
    });
  }

  const percentage = (currentAmount / Number(goal.target_amount)) * 100;

  return {
    currentAmount,
    currentFormatted: formatCurrency(goalCurrencyCode, currentAmount),
    percentage,
    isAmountReached: percentage >= 100,
  };
}
