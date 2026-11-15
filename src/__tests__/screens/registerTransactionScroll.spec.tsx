import React from 'react';
import { Text } from 'react-native';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { ContentScroll } from '@screens/RegisterTransaction/styles';

// Regression guard for the RegisterTransaction scroll fix: the form's
// footer content (type selector + save button) lives inside ContentScroll,
// so the container must render its children. Gesture coordination with the
// 100% bottom sheet (BottomSheetScrollView) is verified by inspection +
// device QA — it is not observable under jest.
describe('RegisterTransaction ContentScroll', () => {
  it('renders its content children', () => {
    const screen = render(
      <ThemeProvider theme={lightTheme}>
        <ContentScroll>
          <Text testID='scroll-child'>Conteúdo</Text>
        </ContentScroll>
      </ThemeProvider>
    );

    expect(screen.getByTestId('scroll-child')).toBeTruthy();
  });
});
