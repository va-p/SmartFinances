import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { Account } from '@screens/Account';
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useAccountDetailQuery } from '@hooks/useAcccountDetailQuery';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';
import { CurrencyProps } from '@interfaces/currencies';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
jest.mock('@hooks/useAccountsQuery', () => ({
  useAccountsQuery: jest.fn(),
}));
jest.mock('@hooks/useAcccountDetailQuery', () => ({
  useAccountDetailQuery: jest.fn(),
}));
jest.mock('@hooks/useTransactionsQuery', () => ({
  useTransactionsQuery: jest.fn(),
}));
jest.mock('@hooks/useAccountMutations', () => ({
  useDeleteAccountMutation: () => ({ mutate: jest.fn() }),
}));
jest.mock('@hooks/useBottomTabBarHeight', () => ({
  useBottomTabBarHeight: () => 0,
}));
jest.mock('@screens/RegisterAccount', () => ({
  RegisterAccount: () => null,
}));
jest.mock('@screens/RegisterTransaction', () => ({
  RegisterTransaction: () => null,
}));
jest.mock('@screens/ChartPeriodSelect', () => ({
  ChartPeriodSelect: () => null,
}));
jest.mock('@database/database', () => ({
  storageConfig: { set: jest.fn(), getString: jest.fn(), getBoolean: jest.fn() },
  storageUser: { set: jest.fn(), getString: jest.fn() },
  storageToken: { set: jest.fn(), getString: jest.fn() },
  DATABASE_USERS: 'user',
  DATABASE_TOKENS: 'token',
  DATABASE_CONFIGS: 'config',
}));
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'group:abc123' }),
  useRouter: () => ({ navigate: mockNavigate }),
  useNavigation: () => ({ goBack: jest.fn() }),
}));
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockAccountsQuery = useAccountsQuery as jest.Mock;
const mockAccountDetailQuery = useAccountDetailQuery as jest.Mock;
const mockTransactionsQuery = useTransactionsQuery as jest.Mock;

const brl: CurrencyProps = { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' };

const members = [
  {
    id: 88,
    name: 'CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO',
    currency: brl,
    type: 'INVESTMENTS',
    balance: 700.06,
    initialAmount: null,
    institution: { id: 'inst-1', name: 'Nubank' },
  },
  {
    id: 89,
    name: 'CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO',
    currency: brl,
    type: 'INVESTMENTS',
    balance: 250.02,
    initialAmount: null,
    institution: { id: 'inst-1', name: 'Nubank' },
  },
];

function presetGroupStore() {
  useCurrentAccountSelected.setState(() => ({
    accountId: 'group:abc123',
    accountName: 'CDB · 100% CDI',
    accountType: 'INVESTMENTS',
    accountSubType: null,
    accountCurrency: brl,
    accountBalance: '950.08',
    accountCreditData: null,
    accountGroupKey: 'FIXED_INCOME|CDB|CDI|100',
    accountGroupMemberIds: ['88', '89'],
  }));
}

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockAccountsQuery.mockReturnValue({
    data: members,
    refetch: jest.fn(),
  });
  mockAccountDetailQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
  });
  mockTransactionsQuery.mockReturnValue({
    data: [],
    isLoading: false,
    refetch: jest.fn(),
  });
  presetGroupStore();
});

describe('Account group mode (INV-04)', () => {
  // INV-04 — group header shows the label, summed balance and count.
  it('shows the group label, summed balance and member count', () => {
    const screen = renderWithTheme(<Account />);

    expect(screen.getByText('CDB · 100% CDI')).toBeTruthy();
    expect(screen.getByText('R$ 950,08')).toBeTruthy();
    expect(screen.getByText('2 contas')).toBeTruthy();
  });

  // INV-04 — every member renders with its own balance.
  it('lists every member with its individual balance', () => {
    const screen = renderWithTheme(<Account />);

    expect(
      screen.getAllByText('CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO')
    ).toHaveLength(2);
    expect(screen.getByText('R$ 700,06')).toBeTruthy();
    expect(screen.getByText('R$ 250,02')).toBeTruthy();
  });

  // INV-03 — a member opens the normal single-account view.
  it('opens the single account and exits group mode on member tap', () => {
    const screen = renderWithTheme(<Account />);
    fireEvent.press(screen.getByTestId('group-member-88'));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/accounts/[accountId]',
      params: { id: '88' },
    });
    expect(
      useCurrentAccountSelected.getState().accountGroupKey
    ).toBeNull();
    expect(useCurrentAccountSelected.getState().accountId).toBe('88');
  });

  // Edge — a group route without store payload shows the error state.
  it('shows the error state when the group payload is missing', () => {
    useCurrentAccountSelected.setState(() => ({
      accountGroupKey: null,
      accountGroupMemberIds: null,
    }));
    const screen = renderWithTheme(<Account />);

    expect(
      screen.getByText(
        'Não foi possível carregar os detalhes da conta. Tente novamente.'
      )
    ).toBeTruthy();
  });
});
