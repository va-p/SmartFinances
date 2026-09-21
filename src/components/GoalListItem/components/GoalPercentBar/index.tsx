import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Container, Percent } from './styles';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from 'styled-components';
import { useFocusEffect } from 'expo-router';

import { ThemeProps } from '@interfaces/theme';

interface Props {
  percentage: number;
  isAmountReached: boolean;
}

export function GoalPercentBar({ percentage, isAmountReached }: Props) {
  const theme = useTheme() as ThemeProps;
  const animatedWidth = useSharedValue(0);

  function updateProgress() {
    animatedWidth.value = withTiming(percentage, {
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
    });
  }

  useFocusEffect(
    useCallback(() => {
      animatedWidth.value = 0;
      updateProgress();
    }, [percentage])
  );

  const AnimatedContainerStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
    maxWidth: '100%',
  }));

  return (
    <Container>
      <Animated.View
        style={[
          styles.percentage,
          AnimatedContainerStyle,
          {
            backgroundColor: isAmountReached
              ? theme.colors.success
              : theme.colors.primary,
          },
        ]}
      ></Animated.View>
      <Percent numberOfLines={1}>{percentage.toFixed(2)}%</Percent>
    </Container>
  );
}

const styles = StyleSheet.create({
  percentage: {
    minHeight: 24,
    maxHeight: 24,
    justifyContent: 'center',
    borderRadius: 8,
  },
});
