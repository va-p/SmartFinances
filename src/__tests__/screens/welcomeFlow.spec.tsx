import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { render, fireEvent, within } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';

import {
  WELCOME_STEPS,
  WelcomeFlow,
  WelcomeStepProps,
} from '@screens/WelcomeFlow';
import { STEP_DASH_STRIDE } from '@components/StepIndicator/styles';
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

// styled-components merges the generated style and the incoming animated
// style into an array; walk it for the animated transform.
const getDashTranslateX = (
  screen: ReturnType<typeof renderWithTheme>
): number => {
  const { style } = screen.getByTestId('welcome-step-dash').props as {
    style: unknown;
  };
  const entries = Array.isArray(style) ? style : [style];
  const animated = entries.find(
    (entry) => Array.isArray((entry as Record<string, unknown>)?.transform)
  ) as { transform: Array<{ translateX: number }> } | undefined;

  if (!animated) {
    throw new Error('StepDash animated transform not found in style prop');
  }

  return animated.transform[0].translateX;
};

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

  // BC-13 — a new steps-array entry renders its bullet and step content with no
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

  // BC-10 — regression (device-found fault): the first step's content
  // column (tallest of the flow) painted over the indicator row and
  // swallowed bullet taps on the first screen only. The step now renders
  // inside a bounded slot, so no step content can reach the indicator area.
  it('renders the active step inside the bounded step slot', () => {
    const screen = renderWithTheme(
      <WelcomeFlow
        steps={[
          { key: 'one', Component: StepOne },
          { key: 'two', Component: StepTwo },
        ]}
      />
    );

    const contentSlot = within(screen.getByTestId('welcome-step-content'));

    expect(contentSlot.getByTestId('step-one-marker')).toBeTruthy();
    // the bullets row stays outside the step slot, above it
    expect(() =>
      contentSlot.getByTestId('welcome-step-bullets-row')
    ).toThrow();
  });

  // BC-26 — shell integration: the flow renders the reusable StepIndicator
  // and its dash slides when the active step changes; the component's full
  // contract (testID prefix, hitSlop targets, dash anchor/positions) lives
  // in stepIndicator.spec.tsx
  it('slides the flow dash to the tapped bullet position', () => {
    const steps = [
      { key: 'one', Component: StepOne },
      { key: 'two', Component: StepTwo },
      { key: 'three', Component: StepThree },
    ];
    const screen = renderWithTheme(<WelcomeFlow steps={steps} />);

    fireEvent.press(screen.getByTestId('welcome-step-bullet-1'));

    // The mock's useAnimatedStyle is non-reactive (recomputed on render, not
    // on shared-value change): rerender so the updated shared value - set
    // synchronously by the effect's withSpring under the mock - lands in
    // the dash style. The expected position is active x stride (the
    // bullet-geometry constant shared by styles and component).
    screen.rerender(
      <ThemeProvider theme={lightTheme}>
        <WelcomeFlow steps={steps} />
      </ThemeProvider>
    );

    expect(getDashTranslateX(screen)).toBe(STEP_DASH_STRIDE);

    fireEvent.press(screen.getByTestId('welcome-step-bullet-2'));
    screen.rerender(
      <ThemeProvider theme={lightTheme}>
        <WelcomeFlow steps={steps} />
      </ThemeProvider>
    );

    expect(getDashTranslateX(screen)).toBe(2 * STEP_DASH_STRIDE);
  });

  // BC-08 — the default flow starts with the brand/intro step (Welcome)
  // and ends with the base-currency selection + auth step (user's reorder)
  it('starts the default flow with the Welcome intro step', () => {
    expect(WELCOME_STEPS[0].key).toBe('welcome');
    expect(WELCOME_STEPS[0].Component).toBe(Welcome);
    expect(WELCOME_STEPS[WELCOME_STEPS.length - 1].key).toBe('base-currency');
  });

  // BC-11 — the intro step's Continuar advances through onNext without
  // requiring anything else
  it('advances from the real Welcome step Continuar through onNext', () => {
    const onNext = jest.fn();
    const screen = renderWithTheme(<Welcome onNext={onNext} />);

    fireEvent.press(screen.getByText('Continuar'));

    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
