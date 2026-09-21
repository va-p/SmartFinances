import { GoalProjectionPoint } from '@utils/buildGoalProjection';

export type GoalChartSeriesItem = {
  value: number | undefined;
};

export type GoalChartSeries = {
  /** Primary dataset, one entry per plotted month. Real months carry their
   * cumulative value; projected months carry a non-numeric placeholder. */
  data: GoalChartSeriesItem[];
  /** Dashed overlay: undefined over the real months except the connect index
   * (last real cumulative), then one value per projected month (D3).
   * Undefined when there is no projection (AC-4). */
  data2?: GoalChartSeriesItem[];
  /** One x-axis label per plotted month, real and projected alike (AC-8). */
  labels: string[];
};

/**
 * Shapes the goal projection points into the LineChart datasets
 * (amendment 3, 2026-09-15, GOAL-54).
 *
 * react-native-gifted-charts renders x-axis labels by mapping over the
 * primary dataset only, so `data` must span the projected months for their
 * date labels to render (AC-8). The projected entries carry `undefined`:
 * with `interpolateMissingValues: false` the library sanitises them to
 * `value: 0, hideDataPoint: true` and draws the trailing range as a
 * transparent segment, leaving the solid line, data points, texts, and focus
 * untouched (design D3).
 */
export function buildGoalChartSeries(
  points: GoalProjectionPoint[]
): GoalChartSeries {
  const firstProjectionIndex = points.findIndex((point) => point.isProjection);
  const realCount =
    firstProjectionIndex === -1 ? points.length : firstProjectionIndex;

  const data = points.map((point, index) => ({
    value: index < realCount ? point.value : undefined,
  }));

  const data2 =
    firstProjectionIndex === -1
      ? undefined
      : points.map((point, index) => ({
          value: index < realCount - 1 ? undefined : point.value,
        }));

  return { data, data2, labels: points.map((point) => point.label) };
}
