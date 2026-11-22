import React from 'react';
import { Alert } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { BankingIntegrations } from '@screens/BankingIntegrations';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useFocusEffect } = jest.requireMock('expo-router');

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
// jest.mock factories cannot close over module scope; the focus callback
// is read back through the mocked useFocusEffect itself.
const mockNavigate = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ navigate: mockNavigate, back: mockBack }),
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

const mockMutateAsync = jest.fn();
const mockOpenConnectSession = jest.fn();
jest.mock('@hooks/useOpeniConnect', () => ({
  useOpeniConnect: () => ({ mutateAsync: mockMutateAsync }),
  openConnectSession: (...args: unknown[]) =>
    (mockOpenConnectSession as jest.Mock)(...args),
}));

const mockWaitForNewIntegration = jest.fn();
jest.mock('@utils/waitForNewIntegration', () => ({
  waitForNewIntegration: (...args: unknown[]) =>
    (mockWaitForNewIntegration as jest.Mock)(...args),
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
  mockMutateAsync.mockResolvedValue({
    connectUrl: 'https://connect.openi/session',
    expiresAt: '2026-11-15T12:00:00.000Z',
  });
  mockOpenConnectSession.mockResolvedValue(null);
});

const connectFixture = {
  id: 28,
  bankName: 'Instituição de Teste',
  lastSyncDate: '2026-11-15T02:40:41.109Z',
  status: 'SYNCED',
  access_status: 'ACTIVE',
};

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

  // CNX-01 — session closes without params but the row was bound meanwhile:
  // success verdict + list updated.
  it('shows success and lists the new integration when the session closes silently', async () => {
    mockWaitForNewIntegration.mockResolvedValue([connectFixture]);
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);

    const screen = renderWithTheme(<BankingIntegrations />);
    await screen.findByText(/Nenhuma conta conectada ainda/);
    fireEvent.press(screen.getByTestId('connect-new-account-button'));

    await screen.findByText('Instituição de Teste');
    expect(alertSpy).toHaveBeenCalledWith(
      'Contas conectadas com sucesso!',
      expect.stringContaining('importadas')
    );
    alertSpy.mockRestore();
  });

  // CNX-02 — session closes and nothing appears: neutral verdict.
  it('shows the neutral alert when no new integration appears', async () => {
    mockWaitForNewIntegration.mockResolvedValue(null);
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);

    const screen = renderWithTheme(<BankingIntegrations />);
    await screen.findByText(/Nenhuma conta conectada ainda/);
    fireEvent.press(screen.getByTestId('connect-new-account-button'));

    await screen.findByText(/Nenhuma conta conectada ainda/);
    expect(alertSpy).toHaveBeenCalledWith(
      'Conexão bancária',
      expect.stringContaining('Nenhuma nova conexão')
    );
    alertSpy.mockRestore();
  });

  // CNX-03 — deep-link return keeps the existing callback navigation.
  it('navigates to the callback screen when params arrive', async () => {
    mockOpenConnectSession.mockResolvedValue({
      itemId: 'item-1',
      status: 'success',
    });

    const screen = renderWithTheme(<BankingIntegrations />);
    await screen.findByText(/Nenhuma conta conectada ainda/);
    fireEvent.press(screen.getByTestId('connect-new-account-button'));

    await screen.findByText(/Nenhuma conta conectada ainda/);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/banking-callback',
      params: { itemId: 'item-1', status: 'success' },
    });
  });
});
