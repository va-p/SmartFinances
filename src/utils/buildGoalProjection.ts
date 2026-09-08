import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { addMonths, format, parse } from 'date-fns';

import { GoalReserveTransactionProps } from '@interfaces/goals';

// Spec amendment 2026-09-08: the projection is capped at 60 future months
// (AC-5); a goal that would not reach its target within the cap still renders
// the capped projection.
const MAX_PROJECTION_MONTHS = 60;

export type GoalProjectionPoint = {
  /** 'yyyy-MM' — sortable month key. */
  monthKey: string;
  /** Cumulative amount in the goal currency at this month. */
  value: number;
  /** X-axis label: pt-BR abbreviated month, with the year appended on the
   * first and last bucket of each year (AC-6). */
  label: string;
  /** False for real months, true for projected months. */
  isProjection: boolean;
};

export type GoalProjectionData = {
  /** Oldest → newest: one bucket per calendar month from the first movement
   * month through the current month, followed by projected months. */
  points: GoalProjectionPoint[];
  /** (last cumulative − first cumulative) / (elapsed month buckets − 1). */
  averageMonthlyProgress: number;
  targetAmount: number;
};

type Props = {
  // `transactions` are the goal-side movement legs in goal currency (D1);
  // a plain GoalProps has none, which renders no chart.
  goal: {
    transactions?: GoalReserveTransactionProps[];
    target_amount: string;
  };
  /** Injectable for deterministic tests; defaults to now. */
  now?: Date;
};

function monthKeyOf(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Month-by-month cumulative evolution of a goal plus a projection at the
 * current average pace (amendment 2026-09-08, GOAL-51/52).
 *
 * History derives from the goal's movement legs: TRANSFER_CREDIT adds, any
 * other leg subtracts (D1). One bucket per calendar month from the first
 * movement month to the current month inclusive; months without movements
 * repeat the previous cumulative. Movements dated after `now` are ignored.
 *
 * Returns null when fewer than 2 distinct movement months exist — there is
 * nothing meaningful to plot (AC-4). The projection extends one point per
 * future month at the average until the target is reached and only exists
 * while the average is positive (AC-2/3/4/5).
 */
export function buildGoalProjection({
  goal,
  now = new Date(),
}: Props): GoalProjectionData | null {
  const targetAmount = Number(goal.target_amount);

  // ── 1. Signed net flow per movement month ───────────────────────────────
  const flowsByMonth = new Map<string, Decimal>();

  for (const transaction of goal.transactions ?? []) {
    const movementDate = new Date(
      transaction.transaction_date ?? transaction.created_at
    );

    if (Number.isNaN(movementDate.getTime())) continue;
    if (movementDate > now) continue;

    const signedAmount =
      transaction.type === 'TRANSFER_CREDIT'
        ? Math.abs(Number(transaction.amount))
        : -Math.abs(Number(transaction.amount));

    const key = monthKeyOf(movementDate);
    flowsByMonth.set(
      key,
      (flowsByMonth.get(key) ?? new Decimal(0)).plus(signedAmount)
    );
  }

  // ── 2. Guard: the chart needs ≥ 2 distinct movement months (AC-4) ──────
  if (flowsByMonth.size < 2) {
    return null;
  }

  const sortedMonthKeys = [...flowsByMonth.keys()].sort();
  const firstMonthDate = parse(sortedMonthKeys[0], 'yyyy-MM', now);
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── 3. One cumulative bucket per month, first movement → current (AC-1).
  // Months without movements repeat the previous cumulative.
  type Bucket = {
    key: string;
    date: Date;
    cumulative: Decimal;
    isProjection: boolean;
  };

  const history: Bucket[] = [];
  let cumulative = new Decimal(0);
  let cursor = firstMonthDate;

  while (cursor <= currentMonthDate) {
    cumulative = cumulative.plus(flowsByMonth.get(monthKeyOf(cursor)) ?? 0);
    history.push({
      key: monthKeyOf(cursor),
      date: cursor,
      cumulative,
      isProjection: false,
    });
    cursor = addMonths(cursor, 1);
  }

  // ── 4. Average monthly progress (AC-3): the denominator counts the
  // elapsed month buckets, so a stall lowers the average.
  const firstCumulative = history[0].cumulative;
  const lastCumulative = history[history.length - 1].cumulative;
  const average = lastCumulative
    .minus(firstCumulative)
    .div(history.length - 1);

  // ── 5. Projection at the average pace, capped at 60 months (AC-2/4/5) ─
  const projection: Bucket[] = [];
  let projected = lastCumulative;
  let projectionMonth = currentMonthDate;

  if (average.greaterThan(0)) {
    let months = 0;
    while (projected.lessThan(targetAmount) && months < MAX_PROJECTION_MONTHS) {
      projected = projected.plus(average);
      projectionMonth = addMonths(projectionMonth, 1);
      months += 1;
      projection.push({
        key: monthKeyOf(projectionMonth),
        date: projectionMonth,
        cumulative: projected,
        isProjection: true,
      });
    }
  }

  // ── 6. Labels (AC-6): the year goes under the first and last bucket of
  // each year across the whole visible range (history + projection).
  const points = [...history, ...projection];

  return {
    points: points.map((point, index) => {
      const year = point.date.getFullYear();
      const isFirstOfYear = points[index - 1]?.date.getFullYear() !== year;
      const isLastOfYear = points[index + 1]?.date.getFullYear() !== year;

      return {
        monthKey: point.key,
        value: point.cumulative.toNumber(),
        label:
          isFirstOfYear || isLastOfYear
            ? format(point.date, "MMM '\n' yyyy", { locale: ptBR })
            : format(point.date, 'MMM', { locale: ptBR }),
        isProjection: point.isProjection,
      };
    }),
    averageMonthlyProgress: average.toNumber(),
    targetAmount,
  };
}
