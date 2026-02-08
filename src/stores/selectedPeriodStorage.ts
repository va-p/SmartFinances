import { create } from 'zustand';

import { PeriodProps } from '@screens/ChartPeriodSelect';

type SelectedPeriod = {
  selectedPeriod: PeriodProps;
  setSelectedPeriod: (selPeriod: PeriodProps) => void;
  selectedDate: Date;
  setSelectedDate: (selectedDate: Date) => void;
};

export const useSelectedPeriod = create<SelectedPeriod>((set) => ({
  selectedPeriod: { id: '1', name: 'Meses', period: 'months' },
  setSelectedPeriod: (selectedPeriod: PeriodProps) =>
    set(() => ({ selectedPeriod: selectedPeriod })),

  selectedDate: new Date(),
  setSelectedDate: (selectedDate: Date) =>
    set(() => ({ selectedDate: selectedDate })),
}));
