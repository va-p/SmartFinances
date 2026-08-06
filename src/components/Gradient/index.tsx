import React from 'react';
import { Container } from './styles';

import { useTheme } from 'styled-components';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  roundCorners?: boolean;
};

export function Gradient({roundCorners}: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container
      colors={[theme.colors.gradientEnd, theme.colors.gradientStart]}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '110%',
        borderTopLeftRadius: roundCorners ? 25 : undefined,
        borderTopRightRadius: roundCorners ? 25 : undefined,
      }}
    />
  );
}
