import React from 'react';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';
import TransactionListItem from '@components/TransactionListItem';

import { TransactionProps } from '@interfaces/transactions';

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 1,
  created_at: '2026-11-12T12:00:00.000Z',
  description: 'Resgate RDB',
  amount: 500,
  amount_formatted: 'R$ 500,00',
  currency: { id: 4, name: 'Real Brasileiro', code: 'BRL', symbol: 'R$' },
  type: 'CREDIT',
  account: {
    id: 10,
    name: 'Conta corrente',
    currency: { id: 4, name: 'Real Brasileiro', code: 'BRL', symbol: 'R$' },
    type: 'BANK',
    balance: 0,
    initialAmount: 0,
  },
  category: {
    id: 'cat-1',
    name: 'Sem categoria',
    icon: { id: 'icon-1', name: 'dots' },
    color: { id: 'color-1', color_code: '#000000' },
  },
  tags: [],
  user_id: 'user-1',
  ...overrides,
});

const renderItem = (data: TransactionProps) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <TransactionListItem
        data={data}
        index={0}
        hideAmount={false}
        onPress={() => undefined}
      />
    </ThemeProvider>
  );

describe('TransactionListItem with unlinked transfer legs (TRC-11)', () => {
  // The row must never touch link data: a null link renders the same row
  // as a linked leg. An unguarded `related_transaction.account` access
  // would throw here, so crash-free render IS the regression signal.
  it('renders an unlinked TRANSFER_DEBIT leg with the outflow icon', () => {
    const singleLeg = Object.assign(
      makeTransaction({ type: 'TRANSFER_DEBIT', amount: -300 }),
      { related_transaction_id: null }
    );

    const screen = renderItem(singleLeg);

    expect(screen.getByText('Resgate RDB')).toBeTruthy();
    expect(
      screen.UNSAFE_queryByProps({ name: 'arrow-up-outline' })
    ).toBeTruthy();
    expect(
      screen.UNSAFE_queryByProps({ name: 'arrow-down-outline' })
    ).toBeNull();
  });

  it('renders an unlinked TRANSFER_CREDIT leg with the inflow icon', () => {
    const singleLeg = Object.assign(
      makeTransaction({ type: 'TRANSFER_CREDIT', amount: 500 }),
      { related_transaction_id: null }
    );

    const screen = renderItem(singleLeg);

    expect(screen.getByText('Resgate RDB')).toBeTruthy();
    expect(
      screen.UNSAFE_queryByProps({ name: 'arrow-down-outline' })
    ).toBeTruthy();
    expect(
      screen.UNSAFE_queryByProps({ name: 'arrow-up-outline' })
    ).toBeNull();
  });
});
