import React from 'react';
import { Container, PeriodRulerDate } from './styles';

interface PeriodRulerListItemProps {
  date: string;
  isActive: boolean;
}

type Props = {
  data: PeriodRulerListItemProps;
  width: number;
  onPress: (date: string) => void;
};

export function PeriodRulerListItem({ data, width, onPress }: Props) {
  const formattedDate =
    data.date.charAt(0).toUpperCase() + data.date.trim().slice(1);

  return (
    <Container style={{ width: width }} onPress={() => onPress(data.date)}>
      <PeriodRulerDate width={width} isActive={data.isActive} numberOfLines={2}>
        {formattedDate}
      </PeriodRulerDate>
    </Container>
  );
}
