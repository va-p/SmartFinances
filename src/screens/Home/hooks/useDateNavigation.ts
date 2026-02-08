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
        case 'months':
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
      const dateFormat =
        selectedPeriod.period === 'months' ? 'MMM yyyy' : 'yyyy';
      const dateParsed = parse(dateAux, dateFormat, new Date(), {
        locale: ptBR,
      });

      const selectedDateAux =
        selectedPeriod.period === 'months'
          ? lastDayOfMonth(new Date(dateParsed))
          : lastDayOfYear(dateParsed);

      setSelectedDate(selectedDateAux);
    },
    [selectedPeriod.period, setSelectedDate]
  );

  return {
    handleDateChange,
    handlePressDate,
  };
}
