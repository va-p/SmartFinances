import React from 'react';
import { Alert } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { Subscriptions } from '@screens/Subscriptions';
import { useSubscriptionsQuery } from '@hooks/useSubscriptionsQuery';

import { TransactionProps, TransactionTypeProps } from '@interfaces/transactions';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
const mockDesignate = jest.fn();
const mockRefetch = jest.fn();
const mockPickerModal = { present: jest.fn(), dismiss: jest.fn() };
const mockChoiceModal = { present: jest.fn(), dismiss: jest.fn() };
const mockRegisterModal = { present: jest.fn(), dismiss: jest.fn() };
let mockSyncedPending = false;
let mockTransactionSelectProps: any;
let mockRegisterTransactionProps: any;

jest.mock('@hooks/useSubscriptionsQuery', () => ({
  useSubscriptionsQuery: jest.fn(),
}));

jest.mock('@hooks/useSubscriptionMutations', () => ({
  useDesignateSyncedSubscriptionMutation: () => ({
    mutate: mockDesignate,
    isPending: mockSyncedPending,
  }),
}));

jest.mock('@hooks/useBottomTabBarHeight', () => ({
  useBottomTabBarHeight: () => 0,
}));

jest.mock('@stores/quotesStorage', () => ({ useQuotes: () => ({}) }));
jest.mock('@stores/userConfigsStorage', () => ({
  useUserConfigs: (selector: any) =>
    selector({ baseCurrency: { code: 'BRL' } }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ navigate: jest.fn() }),
}));

jest.mock('@components/Screen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Screen: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@components/Gradient', () => ({ Gradient: () => null }));
jest.mock('@components/SubscriptionHelpSheet', () => ({
  SubscriptionHelpSheet: () => null,
}));

jest.mock('@components/Header', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    Header: {
      Root: ({ children }: any) => <View>{children}</View>,
      BackButton: () => null,
      Title: ({ title }: any) => <Text>{title}</Text>,
    },
  };
});

jest.mock('@screens/RegisterTransaction', () => ({
  RegisterTransaction: (props: any) => {
    mockRegisterTransactionProps = props;
    return null;
  },
}));

jest.mock('@screens/TransactionSelect', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');
  return {
    TransactionSelect: (props: any) => {
      const { setTransaction, disabled, closeOnSelect } = props;
      mockTransactionSelectProps = props;
      return (
        <View>
          <TouchableOpacity
            testID='select-synced-debit'
            disabled={disabled}
            onPress={() => setTransaction(mockSyncedDebit)}
          />
          <TouchableOpacity
            testID='select-synced-credit'
            disabled={disabled}
            onPress={() => setTransaction(mockSyncedCredit)}
          />
          <TouchableOpacity
            testID='select-manual'
            disabled={disabled}
            onPress={() => setTransaction(mockManualTransaction)}
          />
          <Text testID='picker-disabled'>{String(disabled)}</Text>
          <Text testID='picker-close-on-select'>
            {String(closeOnSelect)}
          </Text>
        </View>
      );
    },
  };
});

jest.mock('@components/Modals/ModalViewSelection', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ModalViewSelection: ({ bottomSheetRef, children, title }: any) => {
      const methods =
        title === 'Selecione a transação' ? mockPickerModal : mockChoiceModal;
      React.useImperativeHandle(bottomSheetRef, () => methods, [methods]);
      return <View>{children}</View>;
    },
  };
});

jest.mock('@components/Modals/ModalViewWithoutHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ModalViewWithoutHeader: ({ bottomSheetRef, children }: any) => {
      React.useImperativeHandle(bottomSheetRef, () => mockRegisterModal, []);
      return <View>{children}</View>;
    },
  };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockUseSubscriptionsQuery = useSubscriptionsQuery as jest.Mock;

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

const makeSyncedTransaction = (id: number, type: TransactionTypeProps) => {
  const transaction = makeTransaction({ id, type });
  return {
    ...transaction,
    account: {
      ...transaction.account,
      banking_integration: {
        id: 1,
        createdAt: 0,
        userId: 1,
        provider: 'OPENI',
        providerIntegrationId: 'provider-1',
        lastSyncDate: '2026-10-01T12:00:00.000Z',
        status: 'SYNCED' as const,
        connectorId: 'connector-1',
        bankName: 'Banco',
        access_status: 'ACTIVE' as const,
      },
    },
  };
};

const mockSyncedDebit = makeSyncedTransaction(11, 'DEBIT');
const mockSyncedCredit = makeSyncedTransaction(12, 'CREDIT');
const mockManualTransaction = makeTransaction({ id: 13, type: 'DEBIT' });

const renderScreen = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <Subscriptions />
    </ThemeProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockSyncedPending = false;
  mockTransactionSelectProps = undefined;
  mockRegisterTransactionProps = undefined;
  mockUseSubscriptionsQuery.mockReturnValue({
    data: [],
    isLoading: false,
    refetch: mockRefetch,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Subscriptions synced picker designation (SSI-01/SSI-04/SSI-06..08)', () => {
  it('designates a synced DEBIT directly without opening RegisterTransaction', () => {
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId('select-synced-debit'));

    expect(mockDesignate).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
    expect(mockRegisterModal.present).not.toHaveBeenCalled();
    expect(mockPickerModal.dismiss).not.toHaveBeenCalled();
  });

  it('dismisses both modals and refreshes after synced CREDIT success', () => {
    mockDesignate.mockImplementation((_id, options) => options.onSuccess());
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId('select-synced-credit'));

    expect(mockDesignate).toHaveBeenCalledWith(12, expect.any(Object));
    expect(mockPickerModal.dismiss).toHaveBeenCalledTimes(1);
    expect(mockChoiceModal.dismiss).toHaveBeenCalledTimes(1);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockRegisterModal.present).not.toHaveBeenCalled();
  });

  it('keeps the picker open and shows the exact alert on failure', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockDesignate.mockImplementation((_id, options) => options.onError());
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId('select-synced-debit'));

    expect(mockPickerModal.dismiss).not.toHaveBeenCalled();
    expect(mockChoiceModal.dismiss).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(mockRegisterModal.present).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'Assinatura',
      'Não foi possível adicionar a assinatura. Verifique sua conexão e tente novamente.'
    );
  });

  it('allows a retry after failure and closes only after the retry succeeds', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockDesignate
      .mockImplementationOnce((_id, options) => options.onError())
      .mockImplementationOnce((_id, options) => options.onSuccess());
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId('select-synced-debit'));
    expect(mockPickerModal.dismiss).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('select-synced-debit'));

    expect(mockDesignate).toHaveBeenCalledTimes(2);
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(mockPickerModal.dismiss).toHaveBeenCalledTimes(1);
    expect(mockChoiceModal.dismiss).toHaveBeenCalledTimes(1);
  });

  it('disables candidate presses and defers picker closing while pending', () => {
    mockSyncedPending = true;
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId('select-synced-debit'));

    expect(mockTransactionSelectProps.disabled).toBe(true);
    expect(mockTransactionSelectProps.closeOnSelect).toBe(false);
    expect(screen.getByTestId('picker-disabled').props.children).toBe('true');
    expect(mockDesignate).not.toHaveBeenCalled();
    expect(mockPickerModal.dismiss).not.toHaveBeenCalled();
  });

  it('keeps manual selection on RegisterTransaction with advanced selectors expanded', () => {
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId('select-manual'));

    expect(mockDesignate).not.toHaveBeenCalled();
    expect(mockRegisterTransactionProps).toMatchObject({
      id: '13',
      initiallyOpenAdvancedSelectors: true,
    });
    expect(mockPickerModal.dismiss).toHaveBeenCalledTimes(1);
    expect(mockChoiceModal.dismiss).toHaveBeenCalledTimes(1);
    expect(mockRegisterModal.present).toHaveBeenCalledTimes(1);
  });
});
