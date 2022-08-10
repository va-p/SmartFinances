import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import {
  Container,
  Details,
  Icon,
  Name,
  Amount,
} from './styles';

type Props = TouchableOpacityProps & {
  icon: string;
  name: string;
  amount: string;
  color: string;
}

export function HistoryCard({
  icon,
  name,
  amount,
  color,
  ...rest
}: Props) {
  return (
    <Container color={color} {...rest}>
      <Details>
        <Icon name={icon} color={color} />
        <Name>{name}</Name>
      </Details>
      <Amount>{amount}</Amount>
    </Container>
  );
}