import React, { useEffect } from 'react';

import {
  StepIndicatorContainer,
  StepBulletsRow,
  StepBullet,
  StepDash,
  STEP_DASH_STRIDE,
} from './styles';

import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  // Number of steps to indicate.
  count: number;
  // Zero-based index of the active step.
  active: number;
  // Called with the tapped step's index.
  onSelect: (index: number) => void;
  // Prefix for the indicator's testIDs (`${testID}-bullet-${index}`,
  // `${testID}-bullets-row`, `${testID}-dash`) so multiple instances in a
  // tree keep unique IDs; defaults to 'step'.
  testID?: string;
};

// Step indicator with tappable bullets and a sliding active-step dash
// (react-native-reanimated). The bullets are uniform dots - the row never
// reflows - and every bullet carries an enlarged tap target (hitSlop); the
// active step is highlighted by the dash, which slides between the bullet
// positions when `active` changes.
export function StepIndicator({
  count,
  active,
  onSelect,
  testID = 'step',
}: Props) {
  // The active-step dash slides between the bullet positions when the
  // active step changes.
  const dashTranslateX = useSharedValue(active * STEP_DASH_STRIDE);

  useEffect(() => {
    dashTranslateX.value = withSpring(active * STEP_DASH_STRIDE);
  }, [active, dashTranslateX]);

  const dashAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dashTranslateX.value }],
  }));

  return (
    <StepIndicatorContainer>
      <StepBulletsRow testID={`${testID}-bullets-row`}>
        {Array.from({ length: count }, (_, index) => (
          <StepBullet
            key={index}
            testID={`${testID}-bullet-${index}`}
            accessibilityRole='button'
            accessibilityLabel={`Passo ${index + 1}`}
            accessibilityState={{ selected: index === active }}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            onPress={() => onSelect(index)}
          />
        ))}

        <StepDash
          testID={`${testID}-dash`}
          style={dashAnimatedStyle}
          pointerEvents='none'
        />
      </StepBulletsRow>
    </StepIndicatorContainer>
  );
}
