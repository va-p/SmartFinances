import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { InstitutionDetails } from '@screens/InstitutionDetails';
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';
import { useCurrentInstitutionSelected } from '@stores/currentInstitutionSelectedStorage';
import { InvestmentAccount } from '@utils/groupInvestments';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
jest.mock('@hooks/useAccountsQuery', () => ({
  useAccountsQuery: jest.fn(),
}));
jest.mock('@hooks/useBottomTabBarHeight', () => ({
  useBottomTabBarHeight: () => 0,
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
  useRouter: () => ({ navigate: mockNavigate }),
  useNavigation: () => ({ goBack: jest.fn() }),
}));
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockAccountsQuery = useAccountsQuery as jest.Mock;

const brl = { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' };

const cdbData = {
  investmentType: 'FIXED_INCOME',
  investmentSubtype: 'CDB',
  investmentStatus: 'ACTIVE',
  rate: '100',
  rateType: 'CDI',
  issuer: 'NU FINANCEIRA S.A.',
  currentGrossAmount: '750.10',
  amountOriginal: '700.00',
  amountProfit: '50.06',
  currentDate: '2026-11-14T00:00:00.000Z',
  issuedAt: null,
  expiresAt: '2028-12-01T00:00:00.000Z',
};

const rawAccounts = [
  {
    id: 88,
    name: 'CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO',
    currency: brl,
    type: 'INVESTMENTS',
    balance: 700.06,
    initialAmount: null,
    institution: { id: 'inst-1', name: 'Nubank' },
    investmentData: { ...cdbData },
  },
  {
    id: 89,
    name: 'CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO',
    currency: brl,
    type: 'INVESTMENTS',
    balance: 250.02,
    initialAmount: null,
    institution: { id: 'inst-1', name: 'Nubank' },
    investmentData: { ...cdbData, currentGrossAmount: '260.00' },
  },
  {
    id: 90,
    name: 'Tesouro Direto',
    currency: brl,
    type: 'INVESTMENTS',
    balance: 500,
    initialAmount: null,
    institution: { id: 'inst-1', name: 'Nubank' },
  },
  {
    id: 10,
    name: 'Conta corrente',
    currency: brl,
    type: 'BANK',
    subtype: 'CHECKING_ACCOUNT',
    balance: 1000,
    initialAmount: null,
    institution: { id: 'inst-1', name: 'Nubank' },
  },
] as unknown as InvestmentAccount[];

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  mockAccountsQuery.mockReturnValue({
    data: rawAccounts,
    isLoading: false,
    isRefetching: false,
    refetch: jest.fn(),
  });
  useCurrentInstitutionSelected.setState(() => ({
    institutionId: 'inst-1',
    institutionName: 'Nubank',
  }));
  useCurrentAccountSelected.setState(() => ({
    accountId: null,
    accountName: null,
    accountGroupKey: null,
    accountGroupMemberIds: null,
  }));
});

describe('InstitutionDetails investment grouping', () => {
  // INV-01 — same-product legs collapse into one row.
  it('collapses repeated positions into a single group row', () => {
    const screen = renderWithTheme(<InstitutionDetails />);

    expect(screen.getByText('CDB · 100% CDI (2)')).toBeTruthy();
    expect(
      screen.queryByText('CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO')
    ).toBeNull();
  });

  // INV-03 — other sections and manual singles render exactly as today.
  it('keeps other sections and singleton investments unchanged', () => {
    const screen = renderWithTheme(<InstitutionDetails />);

    expect(screen.getByText('Contas')).toBeTruthy();
    expect(screen.getByText('Conta corrente')).toBeTruthy();
    expect(screen.getByText('Investimentos')).toBeTruthy();
    expect(screen.getByText('Tesouro Direto')).toBeTruthy();
  });

  // INV-04 — grouping never changes the institution total.
  it('preserves the institution total after grouping', () => {
    const screen = renderWithTheme(<InstitutionDetails />);

    expect(screen.getByText('R$ 2.450,08')).toBeTruthy();
  });

  // INV-03 — tapping a group expands its members inline.
  it('expands the group preview on tap', () => {
    const screen = renderWithTheme(<InstitutionDetails />);
    fireEvent.press(
      screen.getByTestId('investment-group-FIXED_INCOME|CDB|CDI|100')
    );

    expect(
      screen.getAllByText('CDB - NU FINANCEIRA S.A. - SOCIEDADE DE CREDITO')
    ).toHaveLength(2);
  });

  // INV-03 — the expanded group opens the Account screen in group mode.
  it('opens the group account screen with member ids on Ver todas', () => {
    const screen = renderWithTheme(<InstitutionDetails />);
    fireEvent.press(
      screen.getByTestId('investment-group-FIXED_INCOME|CDB|CDI|100')
    );
    fireEvent.press(screen.getByTestId('investment-group-see-all'));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/accounts/[accountId]',
      params: { id: expect.stringMatching(/^group:/) },
    });
    expect(
      useCurrentAccountSelected.getState().accountGroupKey
    ).toBe('FIXED_INCOME|CDB|CDI|100');
    expect(
      useCurrentAccountSelected.getState().accountGroupMemberIds
    ).toEqual(['88', '89']);
  });

  // INV-08 — a rate-label query surfaces the entire matching group.
  it('surfaces the whole group on a rate-label search', () => {
    const screen = renderWithTheme(<InstitutionDetails />);
    fireEvent.press(screen.getByTestId('institution-search-button'));
    fireEvent.changeText(screen.getByPlaceholderText('Pesquisar...'), 'cdi');

    expect(screen.getByText('CDB · 100% CDI (2)')).toBeTruthy();
  });

  // INV-08 — a name query with no group match hides grouped rows.
  it('hides groups with no match on an unrelated search', () => {
    const screen = renderWithTheme(<InstitutionDetails />);
    fireEvent.press(screen.getByTestId('institution-search-button'));
    fireEvent.changeText(screen.getByPlaceholderText('Pesquisar...'), 'tesouro');

    expect(screen.queryByText('CDB · 100% CDI (2)')).toBeNull();
    expect(screen.getByText('Tesouro Direto')).toBeTruthy();
  });

  // INV-03 — opening a single member exits group mode.
  it('clears the group payload when opening a single member', () => {
    const screen = renderWithTheme(<InstitutionDetails />);
    fireEvent.press(
      screen.getByTestId('investment-group-FIXED_INCOME|CDB|CDI|100')
    );
    fireEvent.press(screen.getByTestId('investment-group-see-all'));
    fireEvent.press(screen.getByTestId('account-row-90'));

    expect(
      useCurrentAccountSelected.getState().accountGroupKey
    ).toBeNull();
    expect(useCurrentAccountSelected.getState().accountId).toBe('90');
  });
});
