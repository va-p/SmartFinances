import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';

import {
  WELCOME_STEPS,
  WelcomeFlow,
  WelcomeStepProps,
} from '@screens/WelcomeFlow';
import { Welcome } from '@screens/Welcome';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

// Stub steps: plain components, no bottom-sheet/phosphor dependencies, so the
// shell's own behavior (bullets, navigation, extensibility) is what's tested.
function StepOne({ onNext }: WelcomeStepProps) {
  return (
    <>
      <Text testID='step-one-marker'>Passo um</Text>
      <TouchableOpacity testID='step-one-next' onPress={onNext}>
        <Text>Continuar</Text>
      </TouchableOpacity>
    </>
  );
}

function StepTwo({ onNext }: WelcomeStepProps) {
  return (
    <Text testID='step-two-marker'>{onNext ? 'HAS_NEXT' : 'NO_NEXT'}</Text>
  );
}

function StepThree() {
  return <Text testID='step-three-marker'>Passo três</Text>;
}

const getBulletSelected = (
  screen: ReturnType<typeof renderWithTheme>,
  index: number
) =>
  screen.getByTestId(`welcome-step-bullet-${index}`).props.accessibilityState
    .selected;

describe('WelcomeFlow shell', () => {
  // BC-09 — one bullet per step, the active step's bullet highlighted
  it('renders one bullet per step with the first bullet active', () => {
    const screen = renderWithTheme(
      <WelcomeFlow steps={[{ key: 'one', Component: StepOne }, { key: 'two', Component: StepTwo }]} />
    );

    expect(screen.getByTestId('welcome-step-bullet-0')).toBeTruthy();
    expect(screen.getByTestId('welcome-step-bullet-1')).toBeTruthy();
    expect(screen.queryByTestId('welcome-step-bullet-2')).toBeNull();

    expect(getBulletSelected(screen, 0)).toBe(true);
    expect(getBulletSelected(screen, 1)).toBe(false);

    expect(screen.getByTestId('step-one-marker')).toBeTruthy();
  });

  // BC-10 — tapping a bullet navigates to that step
  it('navigates to a step when its bullet is tapped', () => {
    const screen = renderWithTheme(
      <WelcomeFlow steps={[{ key: 'one', Component: StepOne }, { key: 'two', Component: StepTwo }]} />
    );

    fireEvent.press(screen.getByTestId('welcome-step-bullet-1'));

    expect(screen.getByTestId('step-two-marker')).toBeTruthy();
    expect(getBulletSelected(screen, 0)).toBe(false);
    expect(getBulletSelected(screen, 1)).toBe(true);
  });

  // BC-11 — Continuar (onNext) advances without requiring anything else
  it('advances to the next step when the step calls onNext', () => {
    const screen = renderWithTheme(
      <WelcomeFlow steps={[{ key: 'one', Component: StepOne }, { key: 'two', Component: StepTwo }]} />
    );

    fireEvent.press(screen.getByTestId('step-one-next'));

    expect(screen.getByTestId('step-two-marker')).toBeTruthy();
    expect(getBulletSelected(screen, 1)).toBe(true);
  });

  // BC-08 — the terminal step receives no onNext (auth step owns the CTAs)
  it('renders the last step without an advance callback', () => {
    const screen = renderWithTheme(
      <WelcomeFlow steps={[{ key: 'one', Component: StepOne }, { key: 'two', Component: StepTwo }]} />
    );

    fireEvent.press(screen.getByTestId('step-one-next'));

    expect(screen.getByTestId('step-two-marker').props.children).toBe('NO_NEXT');
  });

  // BC-13 — a new steps-array entry renders its bullet and content with no
  // shell change (third educational stub)
  it('renders an added third step as a third bullet and navigates to it', () => {
    const screen = renderWithTheme(
      <WelcomeFlow
        steps={[
          { key: 'one', Component: StepOne },
          { key: 'two', Component: StepTwo },
          { key: 'three', Component: StepThree },
        ]}
      />
    );

    expect(screen.getByTestId('welcome-step-bullet-2')).toBeTruthy();

    fireEvent.press(screen.getByTestId('welcome-step-bullet-2'));

    expect(screen.getByTestId('step-three-marker')).toBeTruthy();
    expect(getBulletSelected(screen, 2)).toBe(true);
  });

  // BC-08 — the default flow's terminal step is the existing Welcome screen
  it('ends the default flow with the Welcome auth screen', () => {
    expect(WELCOME_STEPS.length).toBeGreaterThanOrEqual(1);
    expect(WELCOME_STEPS[WELCOME_STEPS.length - 1].key).toBe('welcome');
    expect(WELCOME_STEPS[WELCOME_STEPS.length - 1].Component).toBe(Welcome);
  });
});
