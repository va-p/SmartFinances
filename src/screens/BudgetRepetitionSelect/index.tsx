import React from 'react';
import { FlatList } from 'react-native';
import {
  Container
} from './styles';

import { ListItem } from '@components/ListItem';

export interface ChartPeriodProps {
  id: string;
  name: string;
  period: string;
}

type Props = {
  period: ChartPeriodProps;
  setPeriod: (period: ChartPeriodProps) => void;
  closeSelectPeriod: () => void;
}

export function BudgetRepetitionSelect({
  period,
  setPeriod,
  closeSelectPeriod
}: Props) {
  const periods = [
    {
      id: '1',
      name: 'Diariamente',
      period: 'daily'
    },
    {
      id: '2',
      name: 'Semanalmente',
      period: 'weekly'
    },
    {
      id: '3',
      name: 'Quinzenalmente',
      period: 'biweekly'
    },
    {
      id: '4',
      name: 'Mensalmente',
      period: 'monthly'
    },
    {
      id: '5',
      name: 'Anualmente',
      period: 'annually'
    }
  ];

  function handlePeriodSelect(period: ChartPeriodProps) {
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