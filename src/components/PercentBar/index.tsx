import React, { useEffect } from 'react';
import { Container, Percent, Percentage } from './styles';

import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  is_amount_reached: boolean;
  percentage: number;
}

export function PercentBar({ is_amount_reached, percentage }: Props) {
  const sharedProgress = useSharedValue(percentage);
  const styledAnimated = useAnimatedStyle(() => {
    return {
      width: `${sharedProgress.value}%`,
    };
  });

  useEffect(() => {
    sharedProgress.value = withTiming(percentage, { duration: 1000 });
  }, [percentage]);

  return (
    <Container>
      <Percentage is_amount_reached={is_amount_reached} style={styledAnimated}>
        <Percent>{percentage}</Percent>
      </Percentage>
    </Container>
  );
}
