import { useCallback } from 'react';

import {
  addMonths,
  addYears,
  subMonths,
  subYears,
  lastDayOfMonth,
  lastDayOfYear,
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
      const dateSplit = stringDate.split('\n');
      const trimmedDateParts = dateSplit.map((part: string) => part.trim());
      const dateAux = trimmedDateParts.join(' ');
      // 'all' shows month labels, so it parses and jumps like 'months'
      const dateFormat =
        selectedPeriod.period === 'years' ? 'yyyy' : 'MMM yyyy';
      const dateParsed = parse(dateAux, dateFormat, new Date(), {
        locale: ptBR,
      });

      const selectedDateAux =
        selectedPeriod.period === 'years'
          ? lastDayOfYear(dateParsed)
          : lastDayOfMonth(new Date(dateParsed));

      setSelectedDate(selectedDateAux);
    },
    [selectedPeriod.period, setSelectedDate]
  );

  return {
    handleDateChange,
    handlePressDate,
  };
}
