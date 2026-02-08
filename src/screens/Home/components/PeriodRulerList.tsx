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

export const PeriodRulerList = memo(function PeriodRulerList({
  cashFlows,
  selectedPeriod,
  selectedDate,
  handleDateChange,
  handlePressDate,
  periodRulerListColumnWidth,
}: PeriodRulerListProps) {
  const dates = cashFlows
    .filter((cashFlowChartData) => !!cashFlowChartData.label)
    .map((item: any) => {
      const dateSplit = item.label.split('\n');
      const trimmedDateParts = dateSplit.map((part: string) => part.trim());
      const dateAux = trimmedDateParts.join(' ');

      const currentDateFormat =
        selectedPeriod.period === 'months' ? 'MMM yyyy' : 'yyyy';
      let parsedDate: Date | null = null;
      try {
        parsedDate = parse(dateAux, currentDateFormat, selectedDate, {
          locale: ptBR,
        });
        if (!isValid(parsedDate)) {
          console.warn('Data inválida:', dateAux);
        }
      } catch (error) {
        console.error('Erro ao converter data, PeriodRulerList:', error);
      }

      function checkIsActive() {
        let isActive = false;
        switch (selectedPeriod.period) {
          case 'months':
            isActive = parsedDate
              ? getYear(selectedDate) === getYear(parsedDate) &&
                getMonth(selectedDate) === getMonth(parsedDate)
              : false;
            break;

          case 'years':
            isActive = parsedDate
              ? getYear(selectedDate) === getYear(parsedDate)
              : false;
            break;
        }
        return isActive;
      }

      const isActive = checkIsActive();

      return {
        date: item.label,
        isActive,
      };
    })
    .reverse();

  function checkIsActive(month: string) {
    const isActive =
      getMonth(selectedDate) === getMonth(parse(month, 'MMM', selectedDate))
        ? true
        : false;
    return isActive;
  }

  const mocks = [
    {
      date: `Dez \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Dez'),
    },
    {
      date: `Nov \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Nov'),
    },
    {
      date: `Out \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Out'),
    },
    {
      date: `Set \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Set'),
    },
    {
      date: `Ago \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Ago'),
    },
    {
      date: `Jul \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Jul'),
    },
    {
      date: `Jun \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Jun'),
    },
    {
      date: `Mai \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Mai'),
    },
    {
      date: `Abr \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Abr'),
    },
    {
      date: `Mar \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Mar'),
    },
    {
      date: `Fev \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Fev'),
    },
    {
      date: `Jan \n ${getYear(selectedDate)}`,
      isActive: checkIsActive('Jan'),
    },
  ];

  return (
    <PeriodRuler
      dates={dates.length > 0 ? dates : mocks}
      handleDateChange={handleDateChange}
      handlePressDate={handlePressDate}
      periodRulerListColumnWidth={periodRulerListColumnWidth}
    />
  );
});
