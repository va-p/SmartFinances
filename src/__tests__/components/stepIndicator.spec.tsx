import React from 'react';

import { render, fireEvent, within } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';

import { StepIndicator } from '@components/StepIndicator';
import { STEP_DASH_STRIDE } from '@components/StepIndicator/styles';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

// styled-components merges the generated style and the incoming animated
// style into an array; walk it for the animated transform.
const getDashTranslateX = (
  screen: ReturnType<typeof renderWithTheme>,
  testID = 'step-dash'
): number => {
  const { style } = screen.getByTestId(testID).props as {
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

describe('StepIndicator', () => {
  // One tappable bullet per step, the active one marked selected
  it('renders one bullet per step with the active bullet selected', () => {
    const screen = renderWithTheme(
      <StepIndicator count={3} active={1} onSelect={jest.fn()} />
    );

    expect(screen.getByTestId('step-bullet-0')).toBeTruthy();
    expect(screen.getByTestId('step-bullet-1')).toBeTruthy();
    expect(screen.getByTestId('step-bullet-2')).toBeTruthy();
    expect(screen.queryByTestId('step-bullet-3')).toBeNull();

    expect(
      screen.getByTestId('step-bullet-0').props.accessibilityState.selected
    ).toBe(false);
    expect(
      screen.getByTestId('step-bullet-1').props.accessibilityState.selected
    ).toBe(true);
  });

  // Reusable instances keep unique testIDs through the prefix prop
  it('prefixes its testIDs from the testID prop', () => {
    const screen = renderWithTheme(
      <StepIndicator count={2} active={0} onSelect={jest.fn()} testID='welcome-step' />
    );

    expect(screen.getByTestId('welcome-step-bullet-0')).toBeTruthy();
    expect(screen.getByTestId('welcome-step-bullet-1')).toBeTruthy();
    expect(screen.getByTestId('welcome-step-bullets-row')).toBeTruthy();
    expect(screen.getByTestId('welcome-step-dash')).toBeTruthy();
  });

  // Tapping a bullet reports that step's index
  it('calls onSelect with the tapped index', () => {
    const onSelect = jest.fn();
    const screen = renderWithTheme(
      <StepIndicator count={3} active={0} onSelect={onSelect} />
    );

    fireEvent.press(screen.getByTestId('step-bullet-2'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  // Every bullet carries an enlarged tap target (8px dots alone are far
  // below a reliable touch target; hitSlop also covers the inter-bullet
  // margin dead zones)
  it('gives every bullet an enlarged tap target', () => {
    const screen = renderWithTheme(
      <StepIndicator count={2} active={0} onSelect={jest.fn()} />
    );

    expect(screen.getByTestId('step-bullet-0').props.hitSlop).toEqual({
      top: 12,
      right: 12,
      bottom: 12,
      left: 12,
    });
    expect(screen.getByTestId('step-bullet-1').props.hitSlop).toEqual({
      top: 12,
      right: 12,
      bottom: 12,
      left: 12,
    });
  });

  // The dash anchors to the shrink-wrapped bullet row (never a full-width
  // container), together with the bullets
  it('anchors the dash inside the bullet row with the bullets', () => {
    const screen = renderWithTheme(
      <StepIndicator count={2} active={0} onSelect={jest.fn()} />
    );

    const row = within(screen.getByTestId('step-bullets-row'));

    expect(row.getByTestId('step-bullet-0')).toBeTruthy();
    expect(row.getByTestId('step-bullet-1')).toBeTruthy();
    expect(row.getByTestId('step-dash')).toBeTruthy();
  });

  // The dash renders centered over the initial active step's bullet
  it('positions the dash over the initial active step', () => {
    const screen = renderWithTheme(
      <StepIndicator count={3} active={2} onSelect={jest.fn()} />
    );

    expect(getDashTranslateX(screen)).toBe(2 * STEP_DASH_STRIDE);
  });

  // The dash slides into the new active bullet's position when `active`
  // changes. The mock's useAnimatedStyle is non-reactive (recomputed on
  // render, not on shared-value change): the second rerender lands the
  // updated shared value - set synchronously by the effect's withSpring
  // under the mock - into the dash style.
  it('slides the dash to the new active position', () => {
    const screen = renderWithTheme(
      <StepIndicator count={3} active={0} onSelect={jest.fn()} />
    );

    expect(getDashTranslateX(screen)).toBe(0);

    screen.rerender(
      <ThemeProvider theme={lightTheme}>
        <StepIndicator count={3} active={1} onSelect={jest.fn()} />
      </ThemeProvider>
    );
    screen.rerender(
      <ThemeProvider theme={lightTheme}>
        <StepIndicator count={3} active={1} onSelect={jest.fn()} />
      </ThemeProvider>
    );

    expect(getDashTranslateX(screen)).toBe(STEP_DASH_STRIDE);
  });
});
