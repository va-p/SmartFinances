import React from 'react';
import {
  Container,
  Icon,
  Description,
  Title,
  IconChevronDown
} from './styles';

interface Props {
  title: string;
  color: string;
  onPress: () => void;
}

export function AccountSelectButton({
  title,
  color,
  onPress
}: Props) {
  return (
    <Container onPress={onPress}>
      <Description>
        <Icon color={color} name='wallet'/>
        <Title>{title}</Title>
      </Description>
      <IconChevronDown name='chevron-down-outline' />
    </Container>
  )
}