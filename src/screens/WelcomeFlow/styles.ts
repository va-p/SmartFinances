import styled from 'styled-components/native';

import Animated from 'react-native-reanimated';

// Step indicator dimensions: all bullets are uniform dots so the row never
// reflows when the active step changes; the active position is highlighted
// by the StepDash, which the shell slides between bullet positions (BC-26).
export const STEP_BULLET_SIZE = 8;
export const STEP_BULLET_MARGIN = 4;
export const STEP_DASH_WIDTH = 24;
// Horizontal distance between consecutive bullet centers.
export const STEP_DASH_STRIDE = STEP_BULLET_SIZE + 2 * STEP_BULLET_MARGIN;

export const Container = styled.View`
  flex: 1;
  width: 100%;
`;

export const StepIndicatorContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 0 4px 0;
  width: 100%;
`;

// Shrink-wrapped row that anchors the dash to the bullets: absolute
// positioning inside this row is relative to the bullet row itself, not the
// full-width container (which lands the dash top-left of the screen and
// above the container padding).
export const StepBulletsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const StepBullet = styled.TouchableOpacity`
  width: ${STEP_BULLET_SIZE}px;
  height: ${STEP_BULLET_SIZE}px;
  border-radius: ${STEP_BULLET_SIZE / 2}px;
  margin-horizontal: ${STEP_BULLET_MARGIN}px;
  background-color: ${({ theme }) => theme.colors.text};
`;

// The active-step dash: absolutely positioned over the bullet row, centered
// on the first bullet; the shell slides it horizontally between bullet
// positions with reanimated.
export const StepDash = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: ${STEP_BULLET_MARGIN + STEP_BULLET_SIZE / 2 - STEP_DASH_WIDTH / 2}px;
  width: ${STEP_DASH_WIDTH}px;
  height: ${STEP_BULLET_SIZE}px;
  border-radius: ${STEP_BULLET_SIZE / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
