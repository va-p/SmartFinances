import { useCallback } from 'react';

import {
  addMonths,
  addYears,
  addWeeks,
  subMonths,
  subYears,
  subWeeks,
  endOfISOWeek,
  lastDayOfMonth,
  lastDayOfYear,
  startOfDay,
  parse,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { PeriodProps } from '@screens/ChartPeriodSelect';

type UseDateNavigationProps = {
  selectedPeriod: PeriodProps;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

type UseDateNavigationReturn = {
  handleDateChange: (action: 'prev' | 'next') => void;
  handlePressDate: (stringDate: string) => void;
};

export function useDateNavigation({
  selectedPeriod,
  selectedDate,
  setSelectedDate,
}: UseDateNavigationProps): UseDateNavigationReturn {
  const handleDateChange = useCallback(
    (action: 'prev' | 'next'): void => {
      switch (selectedPeriod.period) {
        case 'weeks':
          switch (action) {
            case 'prev':
              setSelectedDate(subWeeks(selectedDate, 1));
              break;
            case 'next':
              setSelectedDate(addWeeks(selectedDate, 1));
              break;
          }
          break;
        // 'all' renders the months ruler, so it navigates like 'months'
        case 'months':
        case 'all':
          switch (action) {
            case 'prev':
              setSelectedDate(subMonths(selectedDate, 1));
              break;
            case 'next':
              setSelectedDate(addMonths(selectedDate, 1));
              break;
          }
          break;
        case 'years':
          switch (action) {
            case 'prev':
              setSelectedDate(subYears(selectedDate, 1));
              break;
            case 'next':
              setSelectedDate(addYears(selectedDate, 1));
              break;
          }
          break;
      }
    },
    [selectedPeriod.period, selectedDate, setSelectedDate]
  );

  const handlePressDate = useCallback(
    (stringDate: string) => {
      const dateAux = stringDate
        .split('\n')
        .map((part: string) => part.trim())
        .join(' ');

      // Ruler taps anchor on the period's last day, mirroring months/years.
      // 'all' shows month labels, so it parses and jumps like 'months'.
      const periodConfig = {
        weeks: {
          dateFormat: "'Sem' I R",
          toPeriodEnd: (date: Date) => startOfDay(endOfISOWeek(date)),
        },
        months: {
          dateFormat: 'MMM yyyy',
          toPeriodEnd: (date: Date) => lastDayOfMonth(date),
        },
        years: {
          dateFormat: 'yyyy',
          toPeriodEnd: (date: Date) => lastDayOfYear(date),
        },
        all: {
          dateFormat: 'MMM yyyy',
          toPeriodEnd: (date: Date) => lastDayOfMonth(date),
        },
      };

      const config = periodConfig[selectedPeriod.period];
      const dateParsed = parse(dateAux, config.dateFormat, new Date(), {
        locale: ptBR,
      });

      setSelectedDate(config.toPeriodEnd(dateParsed));
    },
    [selectedPeriod.period, setSelectedDate]
  );

  return {
    handleDateChange,
    handlePressDate,
  };
}
