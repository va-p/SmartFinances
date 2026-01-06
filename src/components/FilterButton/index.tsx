import React from 'react';
import { Container, Title } from './styles';

import { useTheme } from 'styled-components';
import { RectButtonProps } from 'react-native-gesture-handler';
import CaretDown from 'phosphor-react-native/src/icons/CaretDown';

import { ThemeProps } from '@interfaces/theme';

type Props = RectButtonProps & {
  title: string;
};

export function FilterButton({ title, ...rest }: Props) {
  const theme: ThemeProps = useTheme();

  return (
    <Container {...rest}>
      <Title>{title}</Title>
      <CaretDown size={14} color={theme.colors.text} />
    </Container>
  );
}
