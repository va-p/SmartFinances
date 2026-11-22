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
  // CARD-01 / CARD-02 — both money figures carry their labels.
  // Invoice = creditLimit - availableCreditLimit (500), formatted.
  it('shows "Próxima fatura" and "Limite disponível" labels with values', () => {
    const screen = renderWithTheme(
      <CreditCardListItem data={baseData} index={0} />
    );

    expect(screen.getByText('Próxima fatura')).toBeTruthy();
    expect(screen.getByText('Limite disponível')).toBeTruthy();
    expect(screen.getByText('R$ 500,00')).toBeTruthy();
    expect(screen.getByText('R$ 51.300,00')).toBeTruthy();
  });

  // CARD-03 — hidden mode masks values but keeps labels
  it('masks both values while keeping labels when hideAmount is true', () => {
    const screen = renderWithTheme(
      <CreditCardListItem data={baseData} index={0} hideAmount />
    );

    expect(screen.getByText('Próxima fatura')).toBeTruthy();
    expect(screen.getByText('Limite disponível')).toBeTruthy();
    expect(screen.queryByText('R$ 500,00')).toBeNull();
    expect(screen.queryByText('R$ 51.300,00')).toBeNull();
    expect(screen.getAllByText('•••••').length).toBeGreaterThanOrEqual(2);
  });

  // Edge — missing credit data renders placeholders instead of NaN
  it('shows placeholders when the credit data is missing', () => {
    const withoutLimit: AccountProps = {
      ...baseData,
      creditData: undefined,
    };
    const screen = renderWithTheme(
      <CreditCardListItem data={withoutLimit} index={0} />
    );

    expect(screen.getByText('Próxima fatura')).toBeTruthy();
    expect(screen.getByText('Limite disponível')).toBeTruthy();
    expect(screen.queryByText(/NaN/)).toBeNull();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });
});
