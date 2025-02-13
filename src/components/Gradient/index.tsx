import React from 'react';
import { Container } from './styles';

import theme from '@themes/theme';

export function Gradient() {
  return (
    <Container
      colors={[theme.colors.gradientEnd, theme.colors.gradientStart]}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
      }}
    />
  );
}
