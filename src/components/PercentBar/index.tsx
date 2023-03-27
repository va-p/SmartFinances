import React from 'react';
import { Container, Percent, Percentage } from './styles';

interface Props {
  is_amount_reached: boolean;
  percentage: number;
}

export function PercentBar({ is_amount_reached, percentage }: Props) {
  return (
    <Container>
      <Percentage
        is_amount_reached={is_amount_reached}
        style={{ width: `${percentage}` }}
      >
        <Percent>{percentage}</Percent>
      </Percentage>
    </Container>
  );
}
