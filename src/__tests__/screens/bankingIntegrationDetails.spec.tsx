import React from 'react';
import { Alert } from 'react-native';

import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { BankingIntegrationDetails } from '@screens/BankingIntegrationDetails';
import { useBankingIntegrationDetailQuery } from '@hooks/useBankingIntegrationDetailQuery';
import { useDeleteBankingIntegrationMutation } from '@hooks/useBankingIntegrationMutations';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
// jest.mock factories cannot close over module scope, so they require()
// their dependencies - standard jest pattern.
jest.mock('@hooks/useBankingIntegrationDetailQuery', () => ({
  useBankingIntegrationDetailQuery: jest.fn(),
}));

jest.mock('@hooks/useBankingIntegrationMutations', () => ({
  useDeleteBankingIntegrationMutation: jest.fn(),
}));

jest.mock('@hooks/useOpeniConnect', () => ({
  openConnectSession: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('@api/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ bankingIntegrationID: '28' }),
  useRouter: () => ({ back: mockBack }),
  useNavigation: () => ({ goBack: jest.fn() }),
}));
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockDetailQuery = useBankingIntegrationDetailQuery as jest.Mock;
const mockDeleteMutation = useDeleteBankingIntegrationMutation as jest.Mock;

const integrationData = {
  id: 28,
  createdAt: '2026-11-15T02:40:16.157Z',
  userId: 'user-1',
  provider: 'openi',
  providerIntegrationId: 'item-28',
  lastSyncDate: '2026-11-15T02:40:41.109Z',
  status: 'SYNCED',
  connectorId: 'conn-1',
  bankName: 'Instituição de Teste',
  bankImageUrl: null,
  accounts: [
    {
      id: 10,
      name: 'Conta Corrente',
      type: 'BANK',
      subtype: 'CHECKING_ACCOUNT',
      balance: 1500.5,
      currency: { code: 'BRL', symbol: 'R$' },
      providerAccountId: 'acc-1',
    },
  ],
  access_status: 'ACTIVE',
};

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockDeleteMutation.mockReturnValue({ mutate: jest.fn() });
});

describe('BankingIntegrationDetails', () => {
  // BID-01 — details shows the integration info
  it('shows bank name, status, and linked accounts', () => {
    mockDetailQuery.mockReturnValue({
      data: integrationData,
      isLoading: false,
      error: null,
    });

    const screen = renderWithTheme(<BankingIntegrationDetails />);

    expect(
      screen.getAllByText(/Instituição de Teste/).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Conta Corrente')).toBeTruthy();
    expect(screen.getByTestId('header-delete-button')).toBeTruthy();
  });

  // BID-03 — fetch failure shows the standard error state
  it('shows the error state when the detail fetch fails', () => {
    mockDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('not found'),
    });

    const screen = renderWithTheme(<BankingIntegrationDetails />);

    expect(screen.getByText('Erro')).toBeTruthy();
    expect(
      screen.getByText(
        'Não foi possível carregar os detalhes da conexão. Tente novamente.'
      )
    ).toBeTruthy();
  });

  // BDEL-02 — trash asks for confirmation; cancel aborts
  it('asks for confirmation and deletes on confirm', () => {
    mockDetailQuery.mockReturnValue({
      data: integrationData,
      isLoading: false,
      error: null,
    });
    const mutate = jest.fn();
    mockDeleteMutation.mockReturnValue({ mutate });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const screen = renderWithTheme(<BankingIntegrationDetails />);
    fireEvent.press(screen.getByTestId('header-delete-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Exclusão de conexão',
      expect.stringContaining('contas e transações'),
      expect.anything()
    );
    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === 'Sim, excluir')?.onPress?.();
    expect(mutate).toHaveBeenCalledWith(
      '28',
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    alertSpy.mockRestore();
  });

  // BDEL-02 — cancel does not delete
  it('does not delete when the confirmation is cancelled', () => {
    mockDetailQuery.mockReturnValue({
      data: integrationData,
      isLoading: false,
      error: null,
    });
    const mutate = jest.fn();
    mockDeleteMutation.mockReturnValue({ mutate });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const screen = renderWithTheme(<BankingIntegrationDetails />);
    fireEvent.press(screen.getByTestId('header-delete-button'));

    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === 'Cancelar');
    expect(mutate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
