import React from 'react';
import { Container, Title } from './styles';

import { useTheme } from 'styled-components';
import { RectButtonProps } from 'react-native-gesture-handler';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';

import { ThemeProps } from '@interfaces/theme';

type Props = RectButtonProps & {
  title: string;
};

export function FilterButton({ title, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container {...rest}>
      <Title>{title}</Title>
      <CaretDownIcon size={14} color={theme.colors.text} />
    </Container>
  );
}
