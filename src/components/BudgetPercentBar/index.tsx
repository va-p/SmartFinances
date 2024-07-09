import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import { BudgetProps } from '@interfaces/budget';

import theme from '@themes/theme';
import { Container, Percent } from './styles';

interface Props {
  is_amount_reached: boolean;
  data: BudgetProps;
}

export function BudgetPercentBar({ is_amount_reached, data }: Props) {
  const percent = useSharedValue(0);

  async function calculatePercentage(data: any) {
    const totalSpent = data.amount_spent;
    const totalBudget = data.amount;

    return Math.round((totalSpent / totalBudget) * 100);
  }

  async function updateProgress() {
    const calculatedPercentage = await calculatePercentage(data);
    percent.value = withTiming(calculatedPercentage, {
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
    });
  }

  useFocusEffect(
    useCallback(() => {
      percent.value = 0;

      updateProgress();
    }, [data])
  );

  const AnimatedContainerStyle = useAnimatedStyle(() => ({
    width: `${percent.value}%`,
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
      >
        <Percent numberOfLines={1}>{Number(percent.value).toFixed(2)}%</Percent>
      </Animated.View>
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
