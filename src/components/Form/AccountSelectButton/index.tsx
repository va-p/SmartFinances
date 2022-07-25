import React from 'react';
import {
  Container,
  Description,
  Title,
  Icon,
  IconChevronDown
} from './styles';

interface Props {
  title: string;
  onPress: () => void;
}

export function AccountSelectButton({
  title,
  onPress
}: Props) {
  return (
    <Container onPress={onPress}>
      <Description>
        <Title>{title}</Title>
      </Description>
      <IconChevronDown name='chevron-down-outline' />
    </Container>
  )
}