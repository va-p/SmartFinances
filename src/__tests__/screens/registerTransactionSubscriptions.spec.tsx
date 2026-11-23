import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { RegisterTransaction } from '@screens/RegisterTransaction';
import { useTransactionDetailQuery } from '@hooks/useTransactionDetailQuery';

import { TransactionProps } from '@interfaces/transactions';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
const mockUpdateTransaction = jest.fn();
const mockRecurrenceModal = { present: jest.fn(), dismiss: jest.fn() };
let mockTransactionData: TransactionProps | undefined;
let mockRecurrenceSelectProps: any;
let mockAccountState: any;
const mockEmptyTransactions: TransactionProps[] = [];

jest.mock('@hooks/useTransactionMutations', () => ({
  useCreateTransactionMutation: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateTransactionMutation: () => ({
    mutate: mockUpdateTransaction,
    isPending: false,
  }),
  useDeleteTransactionMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@hooks/useTagsQuery', () => ({
  useTagsQuery: () => ({ data: mockEmptyTransactions, isLoading: false }),
}));
jest.mock('@hooks/useScreenTrace', () => ({ useScreenTrace: jest.fn() }));
jest.mock('@hooks/useAccountsQuery', () => ({
  useAccountsQuery: () => ({ data: mockEmptyTransactions }),
}));
jest.mock('@hooks/useBulkTransactionsQuery', () => ({
  useBulkTransactionsQuery: () => ({
    data: mockEmptyTransactions,
    isLoading: false,
  }),
}));
jest.mock('@hooks/useTransactionDetailQuery', () => ({
  useTransactionDetailQuery: jest.fn(),
}));
jest.mock('@hooks/useTransferDirection', () => ({
  useTransferDirection: () => ({
    transferDirection: 'destination',
    initConversionDirection: jest.fn(),
    toggleTransferDirection: jest.fn(),
  }),
}));

jest.mock('@stores/userStorage', () => ({
  useUser: () => ({ id: 'user-1' }),
}));
jest.mock('@stores/quotesStorage', () => ({
  useQuotes: () => ({
    brlQuoteBtc: { price: 1 },
    brlQuoteEur: { price: 1 },
    brlQuoteUsd: { price: 1 },
    btcQuoteBrl: { price: 1 },
    btcQuoteEur: { price: 1 },
    btcQuoteUsd: { price: 1 },
    eurQuoteBrl: { price: 1 },
    eurQuoteBtc: { price: 1 },
    eurQuoteUsd: { price: 1 },
    usdQuoteBrl: { price: 1 },
    usdQuoteBtc: { price: 1 },
    usdQuoteEur: { price: 1 },
  }),
}));
jest.mock('@stores/userConfigsStorage', () => ({
  useUserConfigs: (selector: any) => selector({ darkMode: false }),
}));
jest.mock('@stores/currentAccountSelectedStorage', () => ({
  useCurrentAccountSelected: () => ({
    accountId: mockAccountState.accountId,
    accountName: mockAccountState.accountName,
    accountCurrency: mockAccountState.accountCurrency,
    accountType: mockAccountState.accountType,
    accountInitialAmount: mockAccountState.accountInitialAmount,
    accountBankingIntegration: mockAccountState.accountBankingIntegration,
    setAccountBankingIntegration: (value: any) => {
      mockAccountState.accountBankingIntegration = value;
    },
    setAccountId: (value: any) => {
      mockAccountState.accountId = value;
    },
    setAccountName: (value: any) => {
      mockAccountState.accountName = value;
    },
    setAccountCurrency: (value: any) => {
      mockAccountState.accountCurrency = value;
    },
    setAccountType: (value: any) => {
      mockAccountState.accountType = value;
    },
    setAccountInitialAmount: (value: any) => {
      mockAccountState.accountInitialAmount = value;
    },
  }),
}));
jest.mock('@stores/useTransactionsStore', () => ({
  useClearSelection: () => jest.fn(),
}));
jest.mock('@api/api', () => ({
  __esModule: true,
  default: { patch: jest.fn() },
}));

jest.mock('@components/Screen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Screen: ({ children }: any) => <View>{children}</View> };
});
jest.mock('@components/Gradient', () => ({ Gradient: () => null }));
jest.mock('@components/Accordion', () => ({
  Accordion: ({ children }: any) => children,
}));
jest.mock('@components/ButtonToggle', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    ButtonToggle: ({ title, value, onValueChange }: any) => (
      <TouchableOpacity testID={`toggle-${title}`} onPress={onValueChange}>
        <Text testID={`toggle-${title}-value`}>{String(value)}</Text>
      </TouchableOpacity>
    ),
  };
});
jest.mock('@components/Button', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  return {
    Button: {
      Root: ({ onPress }: any) => (
        <TouchableOpacity testID='submit-transaction' onPress={onPress} />
      ),
      Text: () => null,
    },
  };
});
jest.mock('@components/SelectButton', () => ({ SelectButton: () => null }));
jest.mock('@components/Form/ControlledInputValue', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  const { Controller } = require('react-hook-form');
  return {
    ControlledInputValue: ({ control, name }: any) => (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput onChangeText={onChange} value={value} />
        )}
      />
    ),
  };
});
jest.mock('@components/Form/ControlledInputWithIcon', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  const { Controller } = require('react-hook-form');
  return {
    ControlledInputWithIcon: ({ control, name }: any) => (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput onChangeText={onChange} value={value} />
        )}
      />
    ),
  };
});
jest.mock(
  '@screens/RegisterTransaction/components/CurrencySelectButton',
  () => ({ CurrencySelectButton: () => null })
);
jest.mock(
  '@screens/RegisterTransaction/components/CategorySelectButton',
  () => ({ CategorySelectButton: () => null })
);
jest.mock(
  '@components/TransactionListItem/components/TransactionTypeButton',
  () => ({ TransactionTypeButton: () => null })
);
jest.mock(
  '@screens/RegisterTransaction/components/TagListItemRegisterTransaction',
  () => ({ TagListItemRegisterTransaction: () => null })
);
jest.mock('@screens/CategorySelect', () => ({ CategorySelect: () => null }));
jest.mock('@screens/CurrencySelect', () => ({ CurrencySelect: () => null }));
jest.mock('@screens/TransactionSelect', () => ({ TransactionSelect: () => null }));
jest.mock('@screens/AccountDestinationSelect', () => ({
  AccountDestinationSelect: () => null,
}));
jest.mock('@screens/RecurrenceSelect', () => {
  const React = require('react');
  const { TouchableOpacity, View } = require('react-native');
  return {
    RecurrenceSelect: (props: any) => {
      const { onSave } = props;
      mockRecurrenceSelectProps = props;
      return (
        <View>
          <TouchableOpacity
            testID='save-recurrence-daily'
            onPress={() => onSave({ interval: 1, period: 'DAILY' })}
          />
          <TouchableOpacity
            testID='save-recurrence-weekly'
            onPress={() => onSave({ interval: 1, period: 'WEEKLY' })}
          />
        </View>
      );
    },
  };
});
jest.mock('@screens/AccountSelect', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  return {
    AccountSelect: ({ setAccount }: any) => (
      <TouchableOpacity
        testID='select-synced-account'
        onPress={() => setAccount(mockSyncedAccount)}
      />
    ),
  };
});
jest.mock('@components/Modals/ModalViewSelection', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ModalViewSelection: ({ bottomSheetRef, children, title }: any) => {
      const methods =
        title === 'Recorrência'
          ? mockRecurrenceModal
          : { present: jest.fn(), dismiss: jest.fn() };
      React.useImperativeHandle(bottomSheetRef, () => methods, [methods]);
      return <View>{children}</View>;
    },
  };
});
jest.mock('react-native-image-viewing', () => () => null);
jest.mock('@react-native-community/datetimepicker', () => () => null);
jest.mock('expo-image-picker', () => ({}));
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockUseTransactionDetailQuery = useTransactionDetailQuery as jest.Mock;
const brl = { id: 1, name: 'Real', code: 'BRL' as const, symbol: 'R$' };
const integration = {
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
};
const mockSyncedAccount = {
  id: 1,
  name: 'Conta sincronizada',
  currency: brl,
  type: 'BANK' as const,
  balance: 0,
  initialAmount: 0,
  banking_integration: integration,
};

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 42,
  created_at: '2026-10-01T12:00:00.000Z',
  transaction_date: '2026-10-01T12:00:00.000Z',
  description: 'Netflix',
  amount: -55.9,
  amount_formatted: 'R$ -55,90',
  amount_in_account_currency: -55.9,
  exchange_rate: null,
  currency: brl,
  type: 'DEBIT',
  account: {
    ...mockSyncedAccount,
    banking_integration: null,
  },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    icon: { id: 'icon-1', name: 'play' },
    color: { id: 'color-1', color_code: '#FFAA29' },
  },
  tags: [],
  user_id: 'user-1',
  is_recurring: false,
  recurrence_interval: null,
  recurrence_period: null,
  is_subscription: false,
  ...overrides,
});

const syncedTransaction = (overrides: Partial<TransactionProps> = {}) =>
  makeTransaction({
    account: { ...mockSyncedAccount },
    ...overrides,
  });

const renderEditor = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <RegisterTransaction
        id={mockTransactionData ? '42' : ''}
        resetId={jest.fn()}
        closeRegisterTransaction={jest.fn()}
        initiallyOpenAdvancedSelectors
      />
    </ThemeProvider>
  );

const toggleValue = (screen: ReturnType<typeof renderEditor>, title: string) =>
  screen.getByTestId(`toggle-${title}-value`).props.children;

beforeEach(() => {
  jest.clearAllMocks();
  mockTransactionData = undefined;
  mockRecurrenceSelectProps = undefined;
  mockAccountState = {
    accountId: null,
    accountName: null,
    accountCurrency: brl,
    accountType: 'BANK',
    accountInitialAmount: 0,
    accountBankingIntegration: undefined,
  };
  mockUseTransactionDetailQuery.mockImplementation(() => ({
    data: mockTransactionData,
    isLoading: false,
  }));
});

describe('RegisterTransaction synced subscription editing (SSI-02/SSI-03/SSI-09)', () => {
  it('turns synced designation on without recurrence or RecurrenceSelect', async () => {
    mockTransactionData = syncedTransaction();
    const screen = renderEditor();
    await waitFor(() => expect(toggleValue(screen, 'Assinatura')).toBe('false'));

    fireEvent.press(screen.getByTestId('toggle-Assinatura'));

    expect(toggleValue(screen, 'Assinatura')).toBe('true');
    expect(toggleValue(screen, 'Recorrente')).toBe('false');
    expect(mockRecurrenceSelectProps.initialPeriod).toBe('DAILY');
    expect(mockRecurrenceModal.present).not.toHaveBeenCalled();
  });

  it('turns synced designation off without changing independent recurrence', async () => {
    mockTransactionData = syncedTransaction({
      is_subscription: true,
      is_recurring: true,
      recurrence_interval: 1,
      recurrence_period: 'WEEKLY',
    });
    const screen = renderEditor();
    await waitFor(() => expect(toggleValue(screen, 'Assinatura')).toBe('true'));

    fireEvent.press(screen.getByTestId('toggle-Assinatura'));

    expect(toggleValue(screen, 'Assinatura')).toBe('false');
    expect(toggleValue(screen, 'Recorrente')).toBe('true');
    expect(mockRecurrenceSelectProps.initialPeriod).toBe('WEEKLY');
    expect(mockRecurrenceModal.present).not.toHaveBeenCalled();
  });

  it('preserves synced designation when recurrence is turned off', async () => {
    mockTransactionData = syncedTransaction({
      is_subscription: true,
      is_recurring: true,
      recurrence_interval: 1,
      recurrence_period: 'MONTHLY',
    });
    const screen = renderEditor();
    await waitFor(() => expect(toggleValue(screen, 'Recorrente')).toBe('true'));

    fireEvent.press(screen.getByTestId('toggle-Recorrente'));

    expect(toggleValue(screen, 'Recorrente')).toBe('false');
    expect(toggleValue(screen, 'Assinatura')).toBe('true');
  });

  it.each(['daily', 'weekly'] as const)(
    'preserves synced designation after a %s recurrence save',
    async (period) => {
      mockTransactionData = syncedTransaction({
        is_subscription: true,
        is_recurring: true,
        recurrence_interval: 1,
        recurrence_period: 'MONTHLY',
      });
      const screen = renderEditor();
      await waitFor(() => expect(toggleValue(screen, 'Assinatura')).toBe('true'));

      fireEvent.press(screen.getByTestId(`save-recurrence-${period}`));

      expect(toggleValue(screen, 'Assinatura')).toBe('true');
      expect(mockRecurrenceSelectProps.initialPeriod).toBe(period.toUpperCase());
    }
  );

  it('hydrates synced recurrence only from is_recurring', async () => {
    mockTransactionData = syncedTransaction({
      is_subscription: true,
      is_recurring: false,
      recurrence_period: null,
    });
    const screen = renderEditor();

    await waitFor(() => expect(toggleValue(screen, 'Assinatura')).toBe('true'));
    expect(toggleValue(screen, 'Recorrente')).toBe('false');
    expect(mockRecurrenceSelectProps.initialPeriod).toBe('DAILY');
    expect(mockRecurrenceModal.present).not.toHaveBeenCalled();
  });

  it('keeps manual subscription toggles coupled to MONTHLY recurrence', async () => {
    mockTransactionData = makeTransaction();
    const screen = renderEditor();
    await waitFor(() => expect(toggleValue(screen, 'Assinatura')).toBe('false'));

    fireEvent.press(screen.getByTestId('toggle-Assinatura'));

    expect(toggleValue(screen, 'Assinatura')).toBe('true');
    expect(toggleValue(screen, 'Recorrente')).toBe('true');
    expect(mockRecurrenceSelectProps.initialPeriod).toBe('MONTHLY');
    expect(mockRecurrenceModal.present).toHaveBeenCalledTimes(1);
  });

  it('uses synced account selection on the next subscription toggle', async () => {
    const screen = renderEditor();

    fireEvent.press(screen.getByTestId('select-synced-account'));
    fireEvent.press(screen.getByTestId('toggle-Assinatura'));

    expect(mockAccountState.accountBankingIntegration).toEqual(integration);
    expect(toggleValue(screen, 'Assinatura')).toBe('true');
    expect(toggleValue(screen, 'Recorrente')).toBe('false');
    expect(mockRecurrenceModal.present).not.toHaveBeenCalled();
  });

  it('saves explicit synced designation without changing stored recurrence', async () => {
    mockTransactionData = syncedTransaction({
      is_subscription: true,
      is_recurring: false,
      recurrence_interval: null,
      recurrence_period: null,
    });
    const screen = renderEditor();
    await waitFor(() => expect(toggleValue(screen, 'Assinatura')).toBe('true'));

    fireEvent.press(screen.getByTestId('submit-transaction'));

    await waitFor(() => expect(mockUpdateTransaction).toHaveBeenCalledTimes(1));
    expect(mockUpdateTransaction.mock.calls[0][0]).toMatchObject({
      transaction_id: '42',
      is_subscription: true,
      is_recurring: false,
      recurrence_interval: null,
      recurrence_period: null,
    });
  });
});
