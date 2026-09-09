import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  ChartContainer,
  LegendContainer,
  LegendDash,
  LegendItem,
  LegendSquare,
  LegendText,
} from './styles';

import { buildGoalProjection } from '@utils/buildGoalProjection';

import { useTheme } from 'styled-components';
import { LineChart } from 'react-native-gifted-charts';

import { SectionTitle } from '../../styles';

import { ThemeProps } from '@interfaces/theme';
import { GoalDetailsProps } from '@interfaces/goals';

type GoalProjectionChartProps = {
  goal: GoalDetailsProps;
  /** The goal's current amount in goal currency (computeGoalProgress) — the
   * series is seeded so its last point equals this value (amendment 2). */
  currentAmount: number;
  // GOAL-53: focused values are hidden while "Ocultar informações" is on.
  hideAmount: boolean;
};

// GoalDetails container horizontal padding is 16px on each side
// (BudgetHistoryChart sizing pattern).
const Y_AXIS_LABEL_WIDTH = 24;
const CHART_HEIGHT = 128;
const MAX_EVENLY_SPREAD_MONTHS = 8;
const SCROLLABLE_MONTH_SPACING = 32;
const INITIAL_SPACING = 16;
const END_SPACING = 8;

export function GoalProjectionChart({
  goal,
  currentAmount,
  hideAmount,
}: GoalProjectionChartProps) {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const CHART_WIDTH = SCREEN_WIDTH - 104;
  const theme = useTheme() as ThemeProps;

  const projection = useMemo(
    () => buildGoalProjection({ goal, currentAmount }),
    [goal, currentAmount]
  );

  const history = useMemo(
    () => projection?.points.filter((point) => !point.isProjection) ?? [],
    [projection]
  );
  const projected = useMemo(
    () => projection?.points.filter((point) => point.isProjection) ?? [],
    [projection]
  );

  // GOAL-51: under 2 distinct movement months there is nothing to plot.
  if (!projection || history.length < 2) {
    return null;
  }

  const data = history.map((point) => ({ value: point.value }));

  // GOAL-52: dashed overlay. Undefined values over the history indices are
  // left undrawn because interpolateMissingValues is false (design D3); the
  // connect index repeats the last real cumulative so the dashed line
  // continues exactly from where the solid line ends.
  const data2 = projected.length
    ? [
        ...history.slice(0, -1).map(() => ({ value: undefined })),
        { value: history[history.length - 1].value },
        ...projected.map((point) => ({ value: point.value })),
      ]
    : undefined;

  const totalMonths = history.length + projected.length;
  const fillsWidth = totalMonths <= MAX_EVENLY_SPREAD_MONTHS;
  const spacing = fillsWidth
    ? (CHART_WIDTH - Y_AXIS_LABEL_WIDTH - INITIAL_SPACING - END_SPACING) /
      Math.max(totalMonths - 1, 1)
    : SCROLLABLE_MONTH_SPACING;

  const values = projection.points.map((point) => point.value);

  return (
    <ChartContainer>
      <SectionTitle>Evolução e projeção</SectionTitle>

      <LineChart
        data={data}
        data2={data2}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        initialSpacing={INITIAL_SPACING}
        endSpacing={END_SPACING}
        spacing={spacing}
        scrollToEnd={!fillsWidth}
        // v1.4.7 defaults this to true; false is what keeps the overlay's
        // undefined history entries undrawn (design D3).
        interpolateMissingValues={false}
        // The target amount is the top Y-axis reference (AC-6); a goal past
        // its target keeps its real peak visible.
        maxValue={Math.max(projection.targetAmount, ...values)}
        mostNegativeValue={Math.min(0, ...values)}
        noOfSections={4}
        color1={theme.colors.primary}
        thickness1={2}
        dataPointsColor1={theme.colors.primary}
        color2={theme.colors.textPlaceholder}
        thickness2={2}
        strokeDashArray2={[6, 4]}
        hideDataPoints2
        showArrow2={!!data2}
        arrowConfig2={{
          length: 12,
          width: 10,
          strokeWidth: 2,
          strokeColor: theme.colors.textPlaceholder,
          fillColor: theme.colors.textPlaceholder,
          showArrowBase: false,
        }}
        focusEnabled
        showStripOnFocus
        // GOAL-53: no value text renders while amounts are hidden.
        showTextOnFocus={!hideAmount}
        showValuesAsDataPointsText
        xAxisLabelTexts={projection.points.map((point) => point.label)}
        xAxisTextNumberOfLines={2}
        xAxisColor={theme.colors.xAxisColor}
        yAxisColor={theme.colors.xAxisColor}
        yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
        xAxisLabelTextStyle={{
          fontSize: 10,
          color: theme.colors.xAxisLabel,
          paddingRight: 12,
        }}
        yAxisTextStyle={{ fontSize: 10, color: theme.colors.textPlaceholder }}
        formatYLabel={(label: string) => {
          // The library formats section labels per device locale; normalize
          // to a plain number (Accounts chart pattern), then compact-k form.
          const s = String(label);
          const lastComma = s.lastIndexOf(',');
          const lastDot = s.lastIndexOf('.');

          let value: number;
          if (lastComma > lastDot) {
            value = Number(s.replace(/\./g, '').replace(',', '.'));
          } else {
            value = Number(s.replace(/,/g, ''));
          }

          const k = Math.floor(Math.abs(value) / 1000);
          return k > 0 ? `${k}k` : String(value);
        }}
        rulesThickness={1}
        rulesColor={theme.colors.chartRule}
        animateOnDataChange
      />

      <LegendContainer>
        <LegendItem>
          <LegendSquare />
          <LegendText>Evolução atual</LegendText>
        </LegendItem>
        {projected.length > 0 && (
          <LegendItem>
            <LegendDash />
            <LegendDash style={{ marginRight: 6 }} />
            <LegendText>Projeção (média atual)</LegendText>
          </LegendItem>
        )}
      </LegendContainer>
    </ChartContainer>
  );
}
