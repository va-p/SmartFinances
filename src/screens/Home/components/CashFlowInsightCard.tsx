import React, { memo } from 'react';

import formatDatePtBr from '@utils/formatDatePtBr';

import { InsightCard } from '@components/InsightCard';

import { eInsightsCashFlow } from '@enums/enumsInsights';
import { CashFlowChartData } from '@interfaces/transactions';

type CashFlowInsightCardProps = {
  cashFlows: CashFlowChartData[];
  selectedDate: Date;
  onClose: () => void;
};

export const CashFlowInsightCard = memo(function CashFlowInsightCard({
  cashFlows,
  selectedDate,
  onClose,
}: CashFlowInsightCardProps) {
  if (cashFlows.length < 1) {
    return null;
  }

  const formattedCurrentDate =
    formatDatePtBr(selectedDate).cashFlowChartMonth();

  const lastRevenueEntryIndex =
    cashFlows.findIndex((cashFlow) => cashFlow.label === formattedCurrentDate) -
    2; // - 2 to get last cash flow instead current cash flow

  if (lastRevenueEntryIndex === -1) {
    return null;
  }

  const revenue = cashFlows[lastRevenueEntryIndex]?.value || 0;
  const expense = cashFlows[lastRevenueEntryIndex + 1]?.value || 0;
  const netCashFlow = revenue - expense;

  const cashFlowIsPositive = netCashFlow >= 0;

  return (
    <InsightCard.Root>
      <InsightCard.CloseButton onPress={onClose} />
      <InsightCard.Title
        title={
          cashFlowIsPositive
            ? eInsightsCashFlow.CONGRATULATIONS_TITLE
            : eInsightsCashFlow.INCENTIVE_TITLE
        }
      />
      <InsightCard.Description
        description={
          cashFlowIsPositive
            ? eInsightsCashFlow.CONGRATULATIONS_DESCRIPTION
            : eInsightsCashFlow.INCENTIVE_DESCRIPTION
        }
      />
    </InsightCard.Root>
  );
});
