import React from 'react';
import {
  Container,
  Description,
  Title,
  Icon,
  Color
} from './styles';

interface Props {
  title: string;
  color: string;
  onPress: () => void;
}

export function ColorSelectButton({
  title,
  color,
  onPress
}: Props) {
  return (
    <Container onPress={onPress}>
      <Description>
        <Title>{title}</Title>
        <Color color={color} />
      </Description>
      <Icon name='chevron-down-outline' />
    </Container>
  )
}