import React from 'react';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { CreditCardListItem } from '@components/CreditCardListItem';
import { AccountProps } from '@interfaces/accounts';

const baseData: AccountProps = {
  id: 1,
  name: 'Nubank',
  currency: { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' },
  type: 'CREDIT',
  balance: 'R$ 1.234,56',
  initialAmount: null,
  creditData: {
    level: 'Gold',
    brand: 'MASTERCARD',
    balanceCloseDate: new Date('2026-11-08'),
    balanceDueDate: new Date('2026-11-15'),
    availableCreditLimit: 51300,
    creditLimit: 51800,
    isLimitFlexible: false,
    balanceForeignCurrency: 500,
    status: 'ACTIVE',
    holderType: 'MAIN',
  },
  institution: { id: '1', name: 'Nubank' },
};

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe('CreditCardListItem', () => {
  // CARD-01 / CARD-02 — both money figures carry their labels
  it('shows "Fatura atual" and "Limite disponível" labels with values', () => {
    const screen = renderWithTheme(
      <CreditCardListItem data={baseData} index={0} />
    );

    expect(screen.getByText('Fatura atual')).toBeTruthy();
    expect(screen.getByText('Limite disponível')).toBeTruthy();
    expect(screen.getByText('R$ 1.234,56')).toBeTruthy();
    expect(screen.getByText('51300')).toBeTruthy();
  });

  // CARD-03 — hidden mode masks values but keeps labels
  it('masks both values while keeping labels when hideAmount is true', () => {
    const screen = renderWithTheme(
      <CreditCardListItem data={baseData} index={0} hideAmount />
    );

    expect(screen.getByText('Fatura atual')).toBeTruthy();
    expect(screen.getByText('Limite disponível')).toBeTruthy();
    expect(screen.queryByText('R$ 1.234,56')).toBeNull();
    expect(screen.getAllByText('•••••').length).toBeGreaterThanOrEqual(2);
  });

  // Edge — missing limit renders a placeholder instead of crashing
  it('shows a placeholder when the available limit is missing', () => {
    const withoutLimit: AccountProps = {
      ...baseData,
      creditData: undefined,
    };
    const screen = renderWithTheme(
      <CreditCardListItem data={withoutLimit} index={0} />
    );

    expect(screen.getByText('Limite disponível')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
  });
});
