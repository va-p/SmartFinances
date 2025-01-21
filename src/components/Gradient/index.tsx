import React from 'react';
import { Container } from './styles';

import { LinearGradientProps } from 'expo-linear-gradient';

export function Gradient() {
  return (
    <Container
      colors={['#E6E9F4', '#FFEBCE']}
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
