import React from 'react';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { BankingIntegrations } from '@screens/BankingIntegrations';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useFocusEffect } = jest.requireMock('expo-router');

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
// jest.mock factories cannot close over module scope; the focus callback
// is read back through the mocked useFocusEffect itself.
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ navigate: jest.fn(), back: jest.fn() }),
  useNavigation: () => ({ goBack: jest.fn() }),
  useFocusEffect: jest.fn((cb: () => void) => {
    const React = require('react');
    // Mirror the real hook: run on mount, re-runnable by the test.
    React.useEffect(() => {
      cb();
    }, []);
  }),
}));

jest.mock('@api/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('@hooks/useBottomTabBarHeight', () => ({
  useBottomTabBarHeight: () => 0,
}));

jest.mock('@stores/benefitsStorage', () => ({
  useBenefits: (selector: (state: any) => unknown) =>
    selector({
      usage: { connections: 0 },
      limits: { connections: 5 },
    }),
}));

jest.mock('@hooks/useOpeniConnect', () => ({
  useOpeniConnect: () => ({ mutateAsync: jest.fn() }),
  openConnectSession: jest.fn(),
}));
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: api } = require('@api/api');

const mockGet = api.get as jest.Mock;

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: [] });
});

describe('BankingIntegrations', () => {
  it('fetches integrations on mount', async () => {
    const screen = renderWithTheme(<BankingIntegrations />);

    await screen.findByText(/Nenhuma conta conectada ainda/);
    expect(mockGet).toHaveBeenCalledWith('/banking-integration/');
  });

  // Deleted rows must disappear when coming back from the details screen:
  // the list refetches on every focus, not only on mount.
  it('refetches integrations on focus', async () => {
    const screen = renderWithTheme(<BankingIntegrations />);

    await screen.findByText(/Nenhuma conta conectada ainda/);
    expect(mockGet).toHaveBeenCalledTimes(1);

    const focusCb = (useFocusEffect as jest.Mock).mock.calls[0][0] as () => void;
    focusCb();

    await screen.findByText(/Nenhuma conta conectada ainda/);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
