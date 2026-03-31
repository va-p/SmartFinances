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
import { useFocusEffect } from '@react-navigation/native';

import { ThemeProps } from '@interfaces/theme';
import { FormattedBudgetProps } from '@interfaces/budget';

interface Props {
  is_amount_reached: boolean;
  data: FormattedBudgetProps;
}

export function BudgetPercentBar({ is_amount_reached, data }: Props) {
  const theme = useTheme() as ThemeProps;
  const animatedWidth = useSharedValue(0);

  function updateProgress() {
    animatedWidth.value = withTiming(data.percentage, {
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
    });
  }

  useFocusEffect(
    useCallback(() => {
      animatedWidth.value = 0;
      updateProgress();
    }, [data.percentage])
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
            backgroundColor: is_amount_reached
              ? theme.colors.attention
              : theme.colors.success,
          },
        ]}
      ></Animated.View>
      <Percent numberOfLines={1}>{data.percentage.toFixed(2)}%</Percent>
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
