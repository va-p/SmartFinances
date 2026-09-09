import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { buildGoalProjection } from '@utils/buildGoalProjection';
import { GoalReserveTransactionProps } from '@interfaces/goals';

/**
 * Spec-anchored tests for buildGoalProjection
 * (spec.md amendment 2026-09-08: AC-1..AC-6 + Independent Test, seeded
 * evolution per amendment 2; design.md D1 — every transaction on the goal's
 * accounts, signed by type).
 */

type GoalInput = Parameters<typeof buildGoalProjection>[0]['goal'];

let movementId = 0;

const movement = (
  amount: number,
  date: string,
  type:
    | 'TRANSFER_CREDIT'
    | 'TRANSFER_DEBIT'
    | 'CREDIT'
    | 'DEBIT' = 'TRANSFER_CREDIT'
): GoalReserveTransactionProps => ({
  id: ++movementId,
  description: 'Transferência',
  amount,
  type,
  transaction_date: date,
  created_at: date,
  category: { id: '1', name: 'Metas' },
  related_transaction_id: null,
});

const buildGoal = (
  transactions: GoalReserveTransactionProps[],
  target_amount = '2000',
  currentAmount: number = transactions.reduce(
    (sum, transaction) =>
      sum +
      (transaction.type === 'DEBIT' || transaction.type === 'TRANSFER_DEBIT'
        ? -Math.abs(transaction.amount)
        : Math.abs(transaction.amount)),
    0
  )
): GoalInput => ({ transactions, target_amount });

// Spec Independent Test pace: R$ 500 deposits in Sep, Oct and Nov 2027
// (reserve balance = current amount = 1500).
const threeMonthlyDeposits = [
  movement(500, '2027-09-05T10:00:00.000Z'),
  movement(500, '2027-10-05T10:00:00.000Z'),
  movement(500, '2027-11-05T10:00:00.000Z'),
];

describe('buildGoalProjection', () => {
  it('builds cumulative buckets and a projection reaching the target one month later (Independent Test, AC-1/2)', () => {
    const result = buildGoalProjection({
      goal: buildGoal(threeMonthlyDeposits, '2000', 1500),
      currentAmount: 1500,
      now: new Date(2027, 10, 15),
    });

    expect(result).not.toBeNull();
    expect(result!.points.map((point) => point.value)).toEqual([
      500, 1000, 1500, 2000,
    ]);
    expect(result!.points.map((point) => point.monthKey)).toEqual([
      '2027-09',
      '2027-10',
      '2027-11',
      '2027-12',
    ]);
    expect(result!.points.map((point) => point.isProjection)).toEqual([
      false,
      false,
      false,
      true,
    ]);
    expect(result!.averageMonthlyProgress).toBe(500);
    expect(result!.targetAmount).toBe(2000);
  });

  it('fills every calendar month to the current one, repeating months without movements, and divides the average by elapsed buckets (AC-1/3)', () => {
    // Same movements, opened two months later: Dec/27 and Jan/28 are empty.
    const result = buildGoalProjection({
      goal: buildGoal(threeMonthlyDeposits, '2000', 1500),
      currentAmount: 1500,
      now: new Date(2028, 0, 15),
    });

    expect(result!.points.map((point) => point.value)).toEqual([
      500, 1000, 1500, 1500, 1500, 1750, 2000,
    ]);
    expect(result!.points.map((point) => point.monthKey)).toEqual([
      '2027-09',
      '2027-10',
      '2027-11',
      '2027-12',
      '2028-01',
      '2028-02',
      '2028-03',
    ]);
    // (1500 − 500) / (5 elapsed buckets − 1) = 250
    expect(result!.averageMonthlyProgress).toBe(250);
  });

  it('returns null with fewer than 2 distinct movement months (AC-4)', () => {
    const singleMonth = [
      movement(500, '2027-09-05T10:00:00.000Z'),
      movement(300, '2027-09-20T10:00:00.000Z'),
    ];

    expect(
      buildGoalProjection({
        goal: buildGoal(singleMonth, '2000', 800),
        currentAmount: 800,
        now: new Date(2027, 10, 15),
      })
    ).toBeNull();
    expect(
      buildGoalProjection({
        goal: buildGoal([], '2000', 0),
        currentAmount: 0,
        now: new Date(2027, 10, 15),
      })
    ).toBeNull();
    // Movements dated after `now` do not count as movement months.
    expect(
      buildGoalProjection({
        goal: buildGoal([
          movement(500, '2027-12-05T10:00:00.000Z'),
          movement(500, '2028-01-05T10:00:00.000Z'),
        ]),
        currentAmount: 0,
        now: new Date(2027, 10, 15),
      })
    ).toBeNull();
  });

  it('subtracts debit legs and renders history without projection when the average is negative (AC-2/4, D1)', () => {
    const result = buildGoalProjection({
      goal: buildGoal([
        movement(1000, '2027-09-05T10:00:00.000Z'),
        movement(500, '2027-10-05T10:00:00.000Z', 'TRANSFER_DEBIT'),
      ]),
      currentAmount: 500,
      now: new Date(2027, 10, 15),
    });

    expect(result!.points.map((point) => point.value)).toEqual([1000, 500, 500]);
    // (500 − 1000) / (3 elapsed buckets − 1) = −250
    expect(result!.averageMonthlyProgress).toBe(-250);
    expect(result!.points.every((point) => !point.isProjection)).toBe(true);
  });

  it('caps the projection at 60 future months and renders the capped projection anyway (AC-5)', () => {
    const result = buildGoalProjection({
      goal: buildGoal(
        [
          movement(10, '2027-09-05T10:00:00.000Z'),
          movement(10, '2027-10-05T10:00:00.000Z'),
        ],
        '100000'
      ),
      currentAmount: 20,
      now: new Date(2027, 9, 15),
    });

    // 2 real buckets + the 60-month cap of projected buckets.
    expect(result!.points).toHaveLength(62);
    const projection = result!.points.filter((point) => point.isProjection);
    expect(projection).toHaveLength(60);
    expect(projection[0].monthKey).toBe('2027-11');
    expect(projection[59].monthKey).toBe('2032-10');
    // 20 + 60 × 10 average — target not reached within the cap.
    expect(projection[59].value).toBe(620);
  });

  it('labels the year only under the first and last bucket of each year (AC-6)', () => {
    const result = buildGoalProjection({
      goal: buildGoal(threeMonthlyDeposits, '2000', 1500),
      currentAmount: 1500,
      now: new Date(2028, 0, 15),
    });

    const withYear = (date: Date) =>
      format(date, "MMM '\n' yyyy", { locale: ptBR });
    const monthOnly = (date: Date) => format(date, 'MMM', { locale: ptBR });

    // 2027: set (first) and dez (last) carry the year; out/nov do not.
    expect(result!.points[0].label).toBe(withYear(new Date(2027, 8, 1)));
    expect(result!.points[1].label).toBe(monthOnly(new Date(2027, 9, 1)));
    expect(result!.points[2].label).toBe(monthOnly(new Date(2027, 10, 1)));
    expect(result!.points[3].label).toBe(withYear(new Date(2027, 11, 1)));
    // 2028: jan (first) and the final projected mar (last) carry the year.
    expect(result!.points[4].label).toBe(withYear(new Date(2028, 0, 1)));
    expect(result!.points[5].label).toBe(monthOnly(new Date(2028, 1, 1)));
    expect(result!.points[6].label).toBe(withYear(new Date(2028, 2, 1)));
  });

  it('ignores movements dated after the current month (D1)', () => {
    const result = buildGoalProjection({
      goal: buildGoal([
        ...threeMonthlyDeposits,
        movement(999, '2027-12-01T10:00:00.000Z'),
      ]),
      currentAmount: 1500,
      now: new Date(2027, 10, 15),
    });

    // History ends at the current month (Nov) — the future deposit does not
    // appear as a real bucket.
    const history = result!.points.filter((point) => !point.isProjection);
    expect(history.map((point) => point.monthKey)).toEqual([
      '2027-09',
      '2027-10',
      '2027-11',
    ]);
    expect(history.map((point) => point.value)).toEqual([500, 1000, 1500]);
    // Dez is a projected bucket at the average (2000); the future R$ 999
    // deposit leaked in would make it a real 2499 bucket.
    expect(result!.points[3].isProjection).toBe(true);
    expect(result!.points[3].value).toBe(2000);
  });

  it('falls back to created_at when transaction_date is missing (D1)', () => {
    const withoutDate = {
      ...movement(500, '2027-10-05T10:00:00.000Z'),
      transaction_date: null as unknown as string,
      created_at: '2027-09-05T10:00:00.000Z',
    };

    const result = buildGoalProjection({
      goal: buildGoal([withoutDate, movement(500, '2027-10-05T10:00:00.000Z')]),
      currentAmount: 1000,
      now: new Date(2027, 10, 15),
    });

    expect(result!.points[0].monthKey).toBe('2027-09');
    expect(result!.points[0].value).toBe(500);
  });

  it('seeds balances that predate the first movement month so the last point equals the current amount (amendment 2, AC-1)', () => {
    // Linked account created with a pre-existing R$ 5.000 balance, then two
    // R$ 500 deposits through the goal flow.
    const result = buildGoalProjection({
      goal: buildGoal(
        [
          movement(500, '2027-09-05T10:00:00.000Z'),
          movement(500, '2027-10-05T10:00:00.000Z'),
        ],
        '10000'
      ),
      currentAmount: 6000,
      now: new Date(2027, 9, 15),
    });

    const history = result!.points.filter((point) => !point.isProjection);
    expect(history.map((point) => point.value)).toEqual([5500, 6000]);
    // The seed does not inflate the pace: (6000 − 5500) / 1 = 500.
    expect(result!.averageMonthlyProgress).toBe(500);
    // The projection starts from the real current amount (6000) and reaches
    // 10000 at the average: 6500 … 10000.
    const projection = result!.points.filter((point) => point.isProjection);
    expect(projection[0].value).toBe(6500);
    expect(projection[projection.length - 1].value).toBe(10000);
    expect(projection[projection.length - 1].monthKey).toBe('2028-06');
  });

  it('counts direct receipts and expenses on linked accounts as monthly flows (amendment 2, D1)', () => {
    const result = buildGoalProjection({
      goal: buildGoal([
        movement(500, '2027-09-05T10:00:00.000Z'),
        movement(1000, '2027-10-05T10:00:00.000Z', 'CREDIT'),
        movement(200, '2027-10-20T10:00:00.000Z', 'DEBIT'),
      ]),
      currentAmount: 1300,
      now: new Date(2027, 10, 15),
    });

    // Sep: goal deposit 500. Oct: +1000 salary, −200 expense → 1300.
    expect(
      result!.points
        .filter((point) => !point.isProjection)
        .map((point) => point.value)
    ).toEqual([500, 1300, 1300]);
    expect(result!.averageMonthlyProgress).toBe(400);
  });
});
