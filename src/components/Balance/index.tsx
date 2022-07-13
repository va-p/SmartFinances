import React from 'react';
import {
  Container,
  Icon,
  Details,
  TitleBalance,
  AmountBalance,
} from './styles'

interface Props {
  type: 'up' | 'down' | 'total';
  title: string;
  amount: string | number;
}

const icon = {
  up: 'arrow-up-circle-outline',
  down: 'arrow-down-circle-outline',
  total: 'cash-outline'
}

export function Balance({ type, title, amount }: Props) {
  return (
    <Container>
      <Icon
        name={icon[type]}
        type={type}
      />
      <Details type={type}>
        <TitleBalance>
          {title}
        </TitleBalance>
        <AmountBalance type={type}>
          {amount}
        </AmountBalance>
      </Details>

    </Container>
  )
}