import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

import { ListItem } from '@components/ListItem';

export interface PeriodProps {
  id: string;
  name: string;
  period: string;
}

type Props = {
  period: PeriodProps;
  setPeriod: (period: PeriodProps) => void;
  closeSelectPeriod: () => void;
};

export function ChartPeriodSelect({
  period,
  setPeriod,
  closeSelectPeriod,
}: Props) {
  const periods = [
    {
      id: '1',
      name: 'Meses',
      period: 'months',
    },
    {
      id: '2',
      name: 'Anos',
      period: 'years',
    },
    {
      id: '3',
      name: 'Tudo',
      period: 'all',
    },
  ];

  function handlePeriodSelect(period: PeriodProps) {
    setPeriod(period);
    closeSelectPeriod();
  }

  return (
    <Container>
      <FlatList
        data={periods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <ListItem
            data={item}
            isActive={period.id === item.id}
            onPress={() => handlePeriodSelect(item)}
          />
        )}
      />
    </Container>
  );
}
