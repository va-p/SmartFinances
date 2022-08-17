import React from 'react';
import { FlatList } from 'react-native';
import {
  Container,
  Period,
  Name,
  Icon
} from './styles';

export interface PeriodProps {
  id: string;
  name: string;
  period: string;
}

type Props = {
  period: PeriodProps;
  setPeriod: (period: PeriodProps) => void;
  closeSelectPeriod: () => void;
}

export function PeriodSelect({
  period,
  setPeriod,
  closeSelectPeriod
}: Props) {
  const periods = [
    {
      id: '1',
      name: 'meses',
      period: 'months'
    },
    {
      id: '2',
      name: 'anos',
      period: 'years'
    }
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
          <Period onPress={() => handlePeriodSelect(item)}>
            <Name isActive={period.id === item.id}>
              {item.name}
            </Name>
            <Icon
              isActive={period.id === item.id} 
              name='checkmark-circle'
            />
          </Period>
        )}
      />
    </Container>
  );
}