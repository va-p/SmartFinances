import React from 'react';
import { PeriodRulerDate } from './styles';

interface PeriodRulerListItemProps {
  date: string;
  isActive: boolean;
}

type Props = {
  data: PeriodRulerListItemProps;
  width: number;
};

export function PeriodRulerListItem({ data, width }: Props) {
  const formattedDate =
    data.date.charAt(0).toUpperCase() + data.date.trim().slice(1);

  return (
    <PeriodRulerDate width={width} isActive={data.isActive} numberOfLines={2}>
      {formattedDate}
    </PeriodRulerDate>
  );
}
