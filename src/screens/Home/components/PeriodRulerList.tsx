import React, { memo } from 'react';

import { parse, getYear, isValid } from 'date-fns';

import { PeriodRuler } from '@components/PeriodRuler';
import { PeriodProps } from '@interfaces/chartPeriod';

import { buildPeriodRulerDates } from '@utils/buildPeriodRulerDates';

import { CashFlowChartData } from '@interfaces/transactions';

type PeriodRulerListProps = {
  cashFlows: CashFlowChartData[];
  selectedPeriod: PeriodProps;
  selectedDate: Date;
  handleDateChange: (action: 'prev' | 'next') => void;
  handlePressDate: (stringDate: string) => void;
  periodRulerListColumnWidth: number;
};

export const PeriodRulerList = memo(function PeriodRulerList({
  cashFlows,
  selectedPeriod,
  selectedDate,
  handleDateChange,
  handlePressDate,
  periodRulerListColumnWidth,
}: PeriodRulerListProps) {
  // Years source for the 'years' ruler: the cash flow chart labels (in years
  // mode they are plain year strings, e.g. "2024"). Other period modes ignore
  // the years param.
  const years = new Set<number>();
  if (selectedPeriod.period === 'years') {
    for (const item of cashFlows) {
      if (!item.label) continue;

      const parsed = parse(String(item.label), 'yyyy', new Date());
      if (isValid(parsed)) {
        years.add(getYear(parsed));
      }
    }
  }

  const dates = buildPeriodRulerDates({
    period: selectedPeriod.period,
    selectedDate,
    years: Array.from(years),
  });

  return (
    <PeriodRuler
      dates={dates}
      handleDateChange={handleDateChange}
      handlePressDate={handlePressDate}
      periodRulerListColumnWidth={periodRulerListColumnWidth}
    />
  );
});
