import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from 'styled-components';

import { SectionTitle } from '@screens/Overview/styles';

import { FormattedBudgetProps } from '@interfaces/budget';
import { ThemeProps } from '@interfaces/theme';
import { TransactionProps } from '@interfaces/transactions';
import {
  buildBudgetHistory,
  formatBudgetHistoryLabel,
  getAverageBudgetSpending,
} from '@utils/buildBudgetHistory';

import {
  ChartContainer,
  LegendContainer,
  LegendDash,
  LegendItem,
  LegendSquare,
  LegendText,
} from './styles';

type BudgetHistoryChartProps = {
  budget: FormattedBudgetProps;
  transactions: TransactionProps[];
};

const SCREEN_WIDTH = Dimensions.get('window').width;
// BudgetDetails container horizontal padding is 16px on each side.
const CHART_WIDTH = SCREEN_WIDTH - 32;
const Y_AXIS_LABEL_WIDTH = 35;
const CHART_HEIGHT = 180;
const MAX_EVENLY_SPREAD_PERIODS = 12;
const MIN_BAR_WIDTH = 10;
const MAX_BAR_WIDTH = 40;
const SCROLLABLE_BAR_WIDTH = 16;
const SCROLLABLE_BAR_SPACING = 24;

export function BudgetHistoryChart({
  budget,
  transactions,
}: BudgetHistoryChartProps) {
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
        noOfSections={4}
        isAnimated
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
          color: theme.colors.textPlaceholder,
        }}
      />

      <LegendContainer>
        <LegendItem>
          <LegendSquare />
          <LegendText>Valor gasto no período</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendDash />
          <LegendText>Média de gastos dos períodos exibidos</LegendText>
        </LegendItem>
      </LegendContainer>
    </ChartContainer>
  );
}
