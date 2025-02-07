import React from 'react';
import { Container, Title } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { CaretDown } from 'phosphor-react-native';

import theme from '@themes/theme';

type Props = RectButtonProps & {
  title: string;
};

export function FilterButton({ title, ...rest }: Props) {
  return (
    <Container {...rest}>
      <Title>{title}</Title>
      <CaretDown size={14} color={theme.colors.text} />
    </Container>
  );
}
