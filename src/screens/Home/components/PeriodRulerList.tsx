import React, { memo } from 'react';

import { ptBR } from 'date-fns/locale';
import { parse, getYear, getMonth, isValid } from 'date-fns';

import { PeriodRuler } from '@components/PeriodRuler';
import { PeriodProps } from '@screens/ChartPeriodSelect';

import { CashFlowChartData } from '@interfaces/transactions';

type PeriodRulerListProps = {
  cashFlows: CashFlowChartData[];
  selectedPeriod: PeriodProps;
  selectedDate: Date;
  handleDateChange: (action: 'prev' | 'next') => void;
  handlePressDate: (stringDate: string) => void;
  periodRulerListColumnWidth: number;
};

const MONTH_ABBREVIATIONS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const PeriodRulerList = memo(function PeriodRulerList({
  cashFlows,
  selectedPeriod,
  selectedDate,
  handleDateChange,
  handlePressDate,
  periodRulerListColumnWidth,
}: PeriodRulerListProps) {
  let dates: { date: string; isActive: boolean }[] = [];

  if (selectedPeriod.period === 'years') {
    // Extract years from cashFlows date labels.
    // In years mode, labels are plain year strings (e.g. "2024").
    const yearsSet = new Set<number>();

    for (const item of cashFlows) {
      if (!item.label) continue;

      try {
        const parsed = parse(String(item.label), 'yyyy', new Date());
        if (isValid(parsed)) {
          yearsSet.add(getYear(parsed));
        }
      } catch {
        // skip invalid
      }
    }

    // Ensure the selected year is always included
    yearsSet.add(getYear(selectedDate));

    const yearsArray = Array.from(yearsSet).sort((a, b) => b - a);

    dates = yearsArray.map((year) => ({
      date: String(year),
      isActive: getYear(selectedDate) === year,
    }));
  } else {
    // 'months' and 'all' — show all 12 months of the selected year
    const year = getYear(selectedDate);

    dates = MONTH_ABBREVIATIONS.map((month) => {
      const dateStr = `${month} \n ${year}`;
      const dateAux = `${month} ${year}`;

      let parsedDate: Date | null = null;
      try {
        parsedDate = parse(dateAux, 'MMM yyyy', selectedDate, {
          locale: ptBR,
        });
      } catch {
        // parsing failure — skip silently
      }

      const isActive = parsedDate && isValid(parsedDate)
        ? getYear(selectedDate) === getYear(parsedDate) &&
          getMonth(selectedDate) === getMonth(parsedDate)
        : false;

      return { date: dateStr, isActive };
    }).reverse(); // newest-first: Dez → Jan (matches inverted FlatList)
  }

  return (
    <PeriodRuler
      dates={dates}
      handleDateChange={handleDateChange}
      handlePressDate={handlePressDate}
      periodRulerListColumnWidth={periodRulerListColumnWidth}
    />
  );
});
