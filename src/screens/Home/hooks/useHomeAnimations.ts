import React from 'react';
import { Dimensions } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS = SCREEN_HEIGHT * 0.48;
const SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS = SCREEN_HEIGHT * 0.32;

type UseHomeAnimationsProps = {
  scrollY: SharedValue<number>;
  insights: boolean;
  showInsights: boolean;
  firstDayOfMonth: boolean;
};

type UseHomeAnimationsReturn = {
  headerStyleAnimation: any;
  chartStyleAnimationOpacity: any;
  insightsStyleAnimationOpacity: any;
  AnimatedViewInitialHeight: number;
};

export function useHomeAnimations({
  scrollY,
  insights,
  showInsights,
  firstDayOfMonth,
}: UseHomeAnimationsProps): UseHomeAnimationsReturn {
  const AnimatedViewInitialHeight =
    insights && showInsights && firstDayOfMonth
      ? SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS
      : SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS;

  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 400],
        [AnimatedViewInitialHeight, 0],
        Extrapolation.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, 370],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const chartStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 300],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const insightsStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  return {
    headerStyleAnimation,
    chartStyleAnimationOpacity,
    insightsStyleAnimationOpacity,
    AnimatedViewInitialHeight,
  };
}
