import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

import { Screen } from '@components/Screen';
import { ListItem } from '@components/ListItem';
import { Gradient } from '@components/Gradient';

import { useSelectedPeriod } from '@storage/selectedPeriodStorage';

export interface PeriodProps {
  id: string;
  name: string;
  period: 'months' | 'years' | 'all';
}

type Props = {
  period: PeriodProps;
  closeSelectPeriod: () => void;
};

export function ChartPeriodSelect({ period, closeSelectPeriod }: Props) {
  const { setSelectedPeriod } = useSelectedPeriod();

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
    setSelectedPeriod(period);
    closeSelectPeriod();
  }

  return (
    <Screen>
      <Container>
        <Gradient />

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
    </Screen>
  );
}
