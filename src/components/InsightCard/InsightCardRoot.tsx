import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Container } from './styles';

import { BlurView } from 'expo-blur';

type InsightCardRootProps = {
  children: ReactNode;
};

export function InsightCardRoot({ children }: InsightCardRootProps) {
  return (
    <Container>
      <BlurView
        intensity={50}
        blurMethod='dimezisBlurView'
        style={{
          ...StyleSheet.absoluteFill,
          flex: 1,
          borderRadius: 25,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      />
      {children}
    </Container>
  );
}
