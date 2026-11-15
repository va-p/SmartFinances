import React from 'react';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { InvestmentGroupListItem } from '@components/InvestmentGroupListItem';
import {
  InvestmentAccount,
  groupInvestments,
} from '@utils/groupInvestments';

const cdb = (overrides: Record<string, any> = {}): InvestmentAccount => ({
  id: 1,
  name: 'CDB - NU FINANCEIRA S.A.',
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  type: 'INVESTMENTS',
  balance: '700.06',
  initialAmount: null,
  investmentData: {
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
  },
  ...overrides,
});

const toBase = (account: InvestmentAccount) => Number(account.balance);

const groupOf = (members: InvestmentAccount[]) =>
  groupInvestments(members, toBase)[0];

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe('InvestmentGroupListItem (Layout 2)', () => {
  // INV-02 — collapsed header shows label, summed balance and count.
  it('shows the group label, summed balance and position count', () => {
    const group = groupOf([
      cdb({ id: 1, balance: '700.06' }),
      cdb({ id: 2, balance: '250.02' }),
    ]);
    const screen = renderWithTheme(
      <InvestmentGroupListItem
        data={group}
        index={0}
        currencyCode="BRL"
      />
    );

    expect(screen.getByText('CDB · 100% CDI (2)')).toBeTruthy();
    expect(screen.getByText('R$ 950,08')).toBeTruthy();
  });

  // INV-05 — rate, profit and maturity render without opening the row.
  it('shows profit and maturity on the group header', () => {
    const group = groupOf([cdb({ id: 1 }), cdb({ id: 2, balance: '250.02' })]);
    const screen = renderWithTheme(
      <InvestmentGroupListItem
        data={group}
        index={0}
        currencyCode="BRL"
      />
    );

    expect(screen.getByText('+R$ 100,12')).toBeTruthy();
    expect(screen.getByText('NU FINANCEIRA S.A. · Venc 12/2028')).toBeTruthy();
  });

  // INV-06 — null fields are omitted, never "null" or NaN.
  it('omits rate, profit and maturity chips when the data is missing', () => {
    const group = groupOf([
      cdb({
        id: 1,
        investmentData: {
          investmentType: 'FIXED_INCOME',
          investmentSubtype: null,
          investmentStatus: 'ACTIVE',
          rate: null,
          rateType: null,
          issuer: null,
          currentGrossAmount: null,
          amountOriginal: null,
          amountProfit: null,
          currentDate: null,
          issuedAt: null,
          expiresAt: null,
        },
      }),
    ]);
    const screen = renderWithTheme(
      <InvestmentGroupListItem
        data={group}
        index={0}
        currencyCode="BRL"
      />
    );

    expect(screen.queryByText(/null/)).toBeNull();
    expect(screen.queryByText(/NaN/)).toBeNull();
    expect(screen.getByText('FIXED_INCOME')).toBeTruthy();
  });

  // INV-02 — hidden mode masks values but keeps labels.
  it('masks balance and profit while keeping labels when hideAmount is true', () => {
    const group = groupOf([cdb({ id: 1 }), cdb({ id: 2 })]);
    const screen = renderWithTheme(
      <InvestmentGroupListItem
        data={group}
        index={0}
        currencyCode="BRL"
        hideAmount
      />
    );

    expect(screen.getByText('CDB · 100% CDI (2)')).toBeTruthy();
    expect(screen.queryByText('R$ 1.400,12')).toBeNull();
    expect(screen.getAllByText('•••••').length).toBeGreaterThanOrEqual(1);
  });

  // Edge — single-member groups render without a count suffix.
  it('renders single-member groups without a count suffix', () => {
    const group = groupOf([cdb({ id: 1 })]);
    const screen = renderWithTheme(
      <InvestmentGroupListItem
        data={group}
        index={0}
        currencyCode="BRL"
      />
    );

    expect(screen.getByText('CDB · 100% CDI')).toBeTruthy();
    expect(screen.queryByText('CDB · 100% CDI (1)')).toBeNull();
  });
});
