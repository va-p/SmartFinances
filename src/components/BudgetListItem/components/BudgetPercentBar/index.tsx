import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Container, Percent } from './styles';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import { BudgetProps } from '@interfaces/budget';

import theme from '@themes/theme';

interface Props {
  is_amount_reached: boolean;
  data: BudgetProps;
}

export function BudgetPercentBar({ is_amount_reached, data }: Props) {
  const animatedWidth = useSharedValue(0);

  function calculatePercentage(data: BudgetProps) {
    const totalSpent = data.amount_spent;
    const totalBudget = data.amount;

    return Math.round((Number(totalSpent) / Number(totalBudget)) * 100);
  }

  function updateProgress() {
    const calculatedPercentage = calculatePercentage(data);
    animatedWidth.value = withTiming(calculatedPercentage, {
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
    });
  }

  useFocusEffect(
    useCallback(() => {
      animatedWidth.value = 0;

      updateProgress();
    }, [data])
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
      <Percent numberOfLines={1}>
        {calculatePercentage(data).toFixed(2)}%
      </Percent>
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
