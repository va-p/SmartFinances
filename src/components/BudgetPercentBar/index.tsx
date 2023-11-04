import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Container, Percent } from './styles';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import theme from '@themes/theme';

interface Props {
  is_amount_reached: boolean;
  percentage: number;
}

export function BudgetPercentBar({ is_amount_reached, percentage }: Props) {
  const sharedProgress = useSharedValue(percentage);

  const AnimatedContainerStyle = useAnimatedStyle(() => {
    return {
      width: `${sharedProgress.value}`,
    };
  });

  useEffect(() => {
    sharedProgress.value = withTiming(percentage, { duration: 3000 });
  }, [percentage]);

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
        <Percent>{percentage}</Percent>
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  percentage: {
    minWidth: '0%',
    maxWidth: '100%',
    minHeight: 24,
    maxHeight: 24,
    justifyContent: 'center',
    borderRadius: 8,
  },
});
