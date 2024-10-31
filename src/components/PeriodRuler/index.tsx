import React from 'react';
import { Container, MonthSelectButton, PeriodRulerList } from './styles';

import { CaretLeft, CaretRight } from 'phosphor-react-native';

import { PeriodRulerListItem } from './components/PeriodRulerListItem';

import theme from '@themes/theme';

type Props = {
  handleDateChange: (direction: 'prev' | 'next') => void;
  dates: any[];
  periodRulerListColumnWidth: number;
};

export function PeriodRuler({
  dates,
  handleDateChange,
  periodRulerListColumnWidth,
}: Props) {
  return (
    <Container>
      <MonthSelectButton onPress={() => handleDateChange('prev')}>
        <CaretLeft size={20} color={theme.colors.text} />
      </MonthSelectButton>
      <PeriodRulerList
        data={dates}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <PeriodRulerListItem data={item} width={periodRulerListColumnWidth} />
        )}
        inverted
      />
      <MonthSelectButton onPress={() => handleDateChange('next')}>
        <CaretRight size={20} color={theme.colors.text} />
      </MonthSelectButton>
    </Container>
  );
}
