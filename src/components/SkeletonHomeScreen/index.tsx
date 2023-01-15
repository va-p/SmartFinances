import React, { useEffect } from 'react';
import {
  Chart,
  Container, Title, Filters, Transaction
} from './styles';

import Animated, { EasingNode } from 'react-native-reanimated';

import theme from '@themes/theme';

export function SkeletonHomeScreen() {
  const skeletonAnimatedValue = new Animated.Value(0)

  const skeletonAnimated = () => {
    skeletonAnimatedValue.setValue(0)
    Animated.timing(
      skeletonAnimatedValue,
      {
        toValue: 1,
        duration: 300,
        easing: EasingNode.out(EasingNode.linear)
      }
    ).start(() => {
      setTimeout(() => {
        skeletonAnimated()
      }, 500);
    })
  };

  const translateX = skeletonAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 100]
  });
  const translateX2 = skeletonAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 380]
  });

  useEffect(() => {
    skeletonAnimated()
  }, []);

  return (
    <Container>
      <Title>
        <Animated.View style={{ width: '30%', height: 32, opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX }] }}></Animated.View>
      </Title>

      <Filters>
        <Animated.View style={{ width: '30%', height: 32, opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX }] }}></Animated.View>
      </Filters>

      <Chart>
        <Animated.View style={{ height: 110, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Chart>

      <Transaction>
        <Animated.View style={{ height: 60, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Transaction>

      <Transaction>
        <Animated.View style={{ height: 60, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Transaction>

      <Transaction>
        <Animated.View style={{ height: 60, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Transaction>

      <Transaction>
        <Animated.View style={{ height: 60, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Transaction>

      <Transaction>
        <Animated.View style={{ height: 60, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Transaction>

      <Transaction>
        <Animated.View style={{ height: 60, backgroundColor: theme.colors.shape, borderRadius: 10 }}>
          <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
        </Animated.View>
      </Transaction>
    </Container>
  );
}