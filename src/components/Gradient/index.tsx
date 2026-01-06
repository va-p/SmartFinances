import React from 'react';
import { Container } from './styles';

import { useTheme } from 'styled-components';

import { ThemeProps } from '@interfaces/theme';

export function Gradient() {
  const theme: ThemeProps = useTheme();

  return (
    <Container
      colors={[theme.colors.gradientEnd, theme.colors.gradientStart]}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '110%',
      }}
    />
  );
}
