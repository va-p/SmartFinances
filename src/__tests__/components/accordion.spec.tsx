import React from 'react';
import { Text } from 'react-native';

import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';
import { Accordion } from '@components/Accordion';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

// styled-components merges the generated style and the incoming animated
// style into an array; walk it for the animated transform (stepIndicator
// spec pattern).
const getCaretRotation = (
  screen: ReturnType<typeof renderWithTheme>
): string => {
  const { style } = screen.getByTestId('accordion-caret').props as {
    style: unknown;
  };
  const entries = Array.isArray(style) ? style : [style];
  const animated = entries.find(
    (entry) => Array.isArray((entry as Record<string, unknown>)?.transform)
  ) as { transform: Array<{ rotate: string }> } | undefined;

  if (!animated) {
    throw new Error('accordion caret animated transform not found');
  }

  return animated.transform[0].rotate;
};

describe('Accordion', () => {
  // SD-12 / SD-13 — content mounts only while expanded
  it('renders no content while collapsed', () => {
    const screen = renderWithTheme(
      <Accordion expanded={false} onToggle={jest.fn()}>
        <Text testID='accordion-child'>Conteúdo</Text>
      </Accordion>
    );

    expect(screen.queryByTestId('accordion-content')).toBeNull();
    expect(screen.queryByTestId('accordion-child')).toBeNull();
  });

  it('renders content while expanded', () => {
    const screen = renderWithTheme(
      <Accordion expanded onToggle={jest.fn()}>
        <Text testID='accordion-child'>Conteúdo</Text>
      </Accordion>
    );

    expect(screen.getByTestId('accordion-content')).toBeTruthy();
    expect(screen.getByTestId('accordion-child')).toBeTruthy();
  });

  // SD-13 — the header toggles through the parent
  it('calls onToggle once when the header is tapped', () => {
    const onToggle = jest.fn();
    const screen = renderWithTheme(
      <Accordion expanded={false} onToggle={onToggle}>
        <Text>Conteúdo</Text>
      </Accordion>
    );

    fireEvent.press(screen.getByTestId('accordion-header'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  // SD-12 — chevron rotates 180 degrees between collapsed (v) and expanded (^)
  it('rotates the chevron 180 degrees between collapsed and expanded', () => {
    const collapsed = renderWithTheme(
      <Accordion expanded={false} onToggle={jest.fn()}>
        <Text>Conteúdo</Text>
      </Accordion>
    );
    const expanded = renderWithTheme(
      <Accordion expanded onToggle={jest.fn()}>
        <Text>Conteúdo</Text>
      </Accordion>
    );

    expect(getCaretRotation(collapsed)).toBe('0deg');
    expect(getCaretRotation(expanded)).toBe('180deg');
  });
});
