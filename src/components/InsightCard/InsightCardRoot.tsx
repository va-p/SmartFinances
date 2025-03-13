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
        experimentalBlurMethod='dimezisBlurView'
        style={{
          ...StyleSheet.absoluteFillObject,
          flex: 1,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      />
      {children}
    </Container>
  );
}
