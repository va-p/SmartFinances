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

import {
  buildBudgetHistory,
  formatBudgetHistoryLabel,
  getAverageBudgetSpending,
} from '@utils/buildBudgetHistory';

import { useTheme } from 'styled-components';
import { BarChart } from 'react-native-gifted-charts';

import { SectionTitle } from '@screens/Overview/styles';

import { ThemeProps } from '@interfaces/theme';
import { FormattedBudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

type BudgetHistoryChartProps = {
  budget: FormattedBudgetProps;
  transactions: TransactionProps[];
};

// BudgetDetails container horizontal padding is 16px on each side.
const Y_AXIS_LABEL_WIDTH = 24;
const CHART_HEIGHT = 100;
const MAX_EVENLY_SPREAD_PERIODS = 12;
const MIN_BAR_WIDTH = 10;
const MAX_BAR_WIDTH = 40;
const SCROLLABLE_BAR_WIDTH = 16;
const SCROLLABLE_BAR_SPACING = 24;

export function BudgetHistoryChart({
  budget,
  transactions,
}: BudgetHistoryChartProps) {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const CHART_WIDTH = SCREEN_WIDTH - 104;
  const theme = useTheme() as ThemeProps;

  const history = useMemo(
    () => buildBudgetHistory(budget, transactions),
    [budget, transactions]
  );

  const average = useMemo(() => getAverageBudgetSpending(history), [history]);

  const chartData = useMemo(
    () =>
      history.map((period) => ({
        value: Math.round(period.amountSpent * 100) / 100,
        label: formatBudgetHistoryLabel(period.startDate),
        frontColor: theme.colors.primary,
      })),
    [history, theme.colors.primary]
  );

  const averageLineData = useMemo(
    () => history.map(() => ({ value: average })),
    [history, average]
  );

  // Few periods: size bars so the chart fills the available width exactly.
  // Many periods: fixed bar sizes + horizontal scroll (Home screen pattern).
  const fillsWidth = history.length <= MAX_EVENLY_SPREAD_PERIODS;

  const { barWidth, spacing } = useMemo(() => {
    if (!fillsWidth) {
      return {
        barWidth: SCROLLABLE_BAR_WIDTH,
        spacing: SCROLLABLE_BAR_SPACING,
      };
    }

    const availableWidth = CHART_WIDTH - Y_AXIS_LABEL_WIDTH;
    const sectionWidth = availableWidth / (history.length + 1);
    const computedBarWidth = Math.min(
      MAX_BAR_WIDTH,
      Math.max(MIN_BAR_WIDTH, sectionWidth * 0.6)
    );

    return {
      barWidth: computedBarWidth,
      spacing:
        (availableWidth - history.length * computedBarWidth) /
        (history.length + 2),
    };
  }, [fillsWidth, history.length]);

  return (
    <ChartContainer>
      <SectionTitle>Histórico do orçamento</SectionTitle>

      <BarChart
        data={chartData}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        barWidth={barWidth}
        spacing={spacing}
        initialSpacing={spacing}
        endSpacing={spacing}
        yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
        roundedTop
        xAxisThickness={1}
        yAxisThickness={0}
        xAxisColor={theme.colors.xAxisColor}
        noOfSections={4}
        isAnimated
        animationDuration={2000}
        scrollToEnd={!fillsWidth}
        showLine
        lineData={averageLineData}
        lineConfig={{
          color: theme.colors.textPlaceholder,
          thickness: 2,
          strokeDashArray: [6, 4],
          hideDataPoints: true,
          isAnimated: true,
        }}
        formatYLabel={(label: string) => {
          const value = Number(label);
          const k = Math.floor(value / 1000);
          return k > 0 ? `${k}k` : String(value);
        }}
        yAxisTextStyle={{ fontSize: 10, color: theme.colors.textPlaceholder }}
        xAxisLabelTextStyle={{
          fontSize: 10,
          color: theme.colors.xAxisLabel,
        }}
        rulesType='solid'
        rulesThickness={1}
        rulesColor={theme.colors.chartRule}
      />

      <LegendContainer>
        <LegendItem>
          <LegendSquare />
          <LegendText>Valor gasto no período</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendDash />
          <LegendDash style={{ marginRight: 6 }} />
          <LegendText>Média de gastos dos períodos</LegendText>
        </LegendItem>
      </LegendContainer>
    </ChartContainer>
  );
}
