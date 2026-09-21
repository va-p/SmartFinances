import { buildGoalChartSeries } from '@utils/buildGoalChartSeries';

import { GoalProjectionPoint } from '@utils/buildGoalProjection';

/**
 * Spec-anchored tests for buildGoalChartSeries
 * (spec.md amendment 3, 2026-09-15: AC-8 — every plotted month, real and
 * projected alike, carries its x-axis date label; design D3 — the dashed
 * overlay connects from the last real month and non-numeric placeholders
 * stay undrawn).
 *
 * Scenario values follow the spec's Independent Test: deposits of 500 in
 * Sep/Oct/Nov (target 2000) → cumulative 500/1000/1500 and a dashed
 * projection reaching 2000 one month later.
 */

function point(
  value: number,
  label: string,
  isProjection: boolean
): GoalProjectionPoint {
  return { monthKey: label, value, label, isProjection };
}

const realPoints = [
  point(500, 'set', false),
  point(1000, 'out', false),
  point(1500, 'nov', false),
];
const projectedPoints = [point(2000, "dez\n26", true)];
const points = [...realPoints, ...projectedPoints];

describe('buildGoalChartSeries', () => {
  it('gives every plotted month a primary-dataset slot and its date label, projected months included (AC-8)', () => {
    const series = buildGoalChartSeries(points);

    expect(series.data).toHaveLength(4);
    expect(series.labels).toEqual(['set', 'out', 'nov', "dez\n26"]);
  });

  it('keeps the real cumulative values and leaves projected months as non-numeric placeholders so they stay undrawn (AC-8, D3)', () => {
    const series = buildGoalChartSeries(points);

    expect(series.data.map((item) => item.value)).toEqual([
      500, 1000, 1500, undefined,
    ]);
  });

  it('keeps the dashed overlay connecting from the last real month until the target (AC-2, D3)', () => {
    const series = buildGoalChartSeries(points);

    expect(series.data2?.map((item) => item.value)).toEqual([
      undefined,
      undefined,
      1500,
      2000,
    ]);
  });

  it('renders no overlay when there is no projection (AC-4)', () => {
    const series = buildGoalChartSeries(realPoints);

    expect(series.data2).toBeUndefined();
    expect(series.data.map((item) => item.value)).toEqual([500, 1000, 1500]);
    expect(series.labels).toEqual(['set', 'out', 'nov']);
  });
});
