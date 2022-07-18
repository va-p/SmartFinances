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
  icon: string;
  onPress: () => void;
}

export function IconSelectButton({
  title,
  icon,
  onPress
}: Props) {
  return (
    <Container onPress={onPress}>
      <Description>
        <Title>{title}</Title>
        <Icon name={icon} />
      </Description>
      <IconChevronDown name='chevron-down-outline' />
    </Container>
  )
}