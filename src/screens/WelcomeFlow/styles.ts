import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  width: 100%;
`;

// The step slot: bounds the active step's content to its own area. A
// step's overflowing children (percentage blocks, tall images, big fixed
// margins) can then never paint over or steal taps from the step indicator
// above (device-found fault: bullets untappable on the first screen only,
// where the step content column is tallest).
export const StepContent = styled.View`
  flex: 1;
  overflow: hidden;
`;
