import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';
import { TransactionSelect } from '@screens/TransactionSelect';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

import { TransactionProps } from '@interfaces/transactions';

// jest.mock factories cannot close over module scope, so they require()
// their dependencies - standard jest pattern, hence the scoped disables.
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
jest.mock('@hooks/useTransactionsQuery', () => ({
  useTransactionsQuery: jest.fn(),
}));

jest.mock('@components/TransactionListItem', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');

  return {
    __esModule: true,
    default: ({ data, onPress }: any) => (
      <TouchableOpacity
        testID={`transaction-row-${data.id}`}
        onPress={onPress}
      />
    ),
  };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockUseTransactionsQuery = useTransactionsQuery as jest.Mock;

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 1,
  created_at: '2026-10-01T12:00:00.000Z',
  description: 'Netflix',
  amount: -55.9,
  amount_formatted: 'R$ -55,90',
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  type: 'DEBIT',
  account: {
    id: 1,
    name: 'Conta',
    currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
    type: 'BANK',
    balance: 0,
    initialAmount: 0,
  },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    color: { color_code: '#FFAA29' },
  },
  tags: [],
  user_id: 'user-1',
  ...overrides,
});

const renderScreen = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <TransactionSelect
        setTransaction={jest.fn()}
        closeSelectTransaction={jest.fn()}
      />
    </ThemeProvider>
  );

beforeEach(() => {
  mockUseTransactionsQuery.mockReset();
});

describe('TransactionSelect', () => {
  // SD-06 — the screen wires the candidate filter
  it('renders only credit/debit transactions not yet designated', () => {
    const debit = makeTransaction({ id: 1, type: 'DEBIT' });
    const transferOut = makeTransaction({ id: 2, type: 'TRANSFER_DEBIT' });
    const credit = makeTransaction({ id: 3, type: 'CREDIT' });
    const alreadySubscription = makeTransaction({ id: 4, is_subscription: true });
    const transferIn = makeTransaction({ id: 5, type: 'TRANSFER_CREDIT' });

    mockUseTransactionsQuery.mockReturnValue({
      data: [debit, transferOut, credit, alreadySubscription, transferIn],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    const screen = renderScreen();

    expect(screen.getByTestId('transaction-row-1')).toBeTruthy();
    expect(screen.getByTestId('transaction-row-3')).toBeTruthy();
    expect(screen.queryByTestId('transaction-row-2')).toBeNull();
    expect(screen.queryByTestId('transaction-row-4')).toBeNull();
    expect(screen.queryByTestId('transaction-row-5')).toBeNull();
  });

  // SD-07 — selection contract: setTransaction with the tapped item, then close
  it('selects the tapped transaction and closes', () => {
    const debit = makeTransaction({ id: 1, type: 'DEBIT' });
    const setTransaction = jest.fn();
    const closeSelectTransaction = jest.fn();

    mockUseTransactionsQuery.mockReturnValue({
      data: [debit],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    const screen = render(
      <ThemeProvider theme={lightTheme}>
        <TransactionSelect
          setTransaction={setTransaction}
          closeSelectTransaction={closeSelectTransaction}
        />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByTestId('transaction-row-1'));

    expect(setTransaction).toHaveBeenCalledWith(debit);
    expect(closeSelectTransaction).toHaveBeenCalledTimes(1);
  });

  // SD-08 — empty state copy
  it('shows the empty state when no transaction qualifies', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    const screen = renderScreen();

    expect(
      screen.getByText(
        'Nenhuma transação elegível. Apenas transações de crédito ou débito ainda não classificadas como assinatura podem ser selecionadas.'
      )
    ).toBeTruthy();
  });

  // SD-09 — loading indicator while the query loads
  it('shows the loading indicator while the transactions query loads', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    const screen = renderScreen();

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  // SD-10 — error alert copy
  it('alerts the retry hint when the transactions query fails', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    mockUseTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      isRefetching: false,
    });

    renderScreen();

    expect(alertSpy).toHaveBeenCalledWith(
      'Transações',
      'Não foi possível buscar as suas transações. Verifique sua conexão com a internet e tente novamente.'
    );
    alertSpy.mockRestore();
  });
});
