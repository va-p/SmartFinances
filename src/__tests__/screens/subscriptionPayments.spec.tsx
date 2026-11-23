import React from 'react';
import { FlatList } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { SubscriptionPayments } from '@screens/SubscriptionPayments';
import { useSubscriptionPaymentsQuery } from '@hooks/useSubscriptionPaymentsQuery';

import { SubscriptionPaymentProps } from '@interfaces/subscriptions';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
const mockNavigate = jest.fn();
let mockPayments: SubscriptionPaymentProps[] = [];

jest.mock('@hooks/useSubscriptionPaymentsQuery', () => ({
  useSubscriptionPaymentsQuery: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ month: '2026-08' }),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn() }),
}));
jest.mock('@stores/quotesStorage', () => ({ useQuotes: () => ({}) }));
jest.mock('@stores/userConfigsStorage', () => ({
  useUserConfigs: (selector: any) =>
    selector({ baseCurrency: { code: 'BRL' } }),
}));
jest.mock('@components/Screen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Screen: ({ children }: any) => <View>{children}</View> };
});
jest.mock('@components/Gradient', () => ({ Gradient: () => null }));
jest.mock('@components/Header', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    Header: {
      Root: ({ children }: any) => <View>{children}</View>,
      CloseButton: () => null,
      Title: ({ title }: any) => <Text>{title}</Text>,
    },
  };
});
jest.mock('@components/Modals/ModalView', () => ({ ModalView: () => null }));
jest.mock('@components/SubscriptionHelpSheet', () => ({
  SubscriptionHelpSheet: () => null,
}));
jest.mock('@components/ListEmptyComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ListEmptyComponent: ({ text }: any) => <Text>{text}</Text>,
  };
});
jest.mock('@components/SubscriptionPaymentListItem', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    SubscriptionPaymentListItem: ({ data, onPress }: any) => (
      <TouchableOpacity
        testID={`payment-${data.subscription_id}-${
          data.transaction_id ?? 'pending'
        }`}
        onPress={onPress}
      >
        <Text>{data.description}</Text>
        <Text testID={`paid-${data.transaction_id ?? 'pending'}`}>
          {String(data.is_paid)}
        </Text>
      </TouchableOpacity>
    ),
  };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockUseSubscriptionPaymentsQuery = useSubscriptionPaymentsQuery as jest.Mock;
const seriesId = '7b386a1c-91ef-43ed-a9f4-fcf8a74f02db';
const chargeDate = '2026-08-06T12:00:00.000Z';

const makePayment = (
  overrides: Partial<SubscriptionPaymentProps> = {}
): SubscriptionPaymentProps => ({
  subscription_id: seriesId,
  source: 'SYNCED',
  transaction_id: 101,
  description: 'Netflix',
  amount: 55.9,
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    icon: { id: 'icon-1', name: 'play' },
    color: { id: 'color-1', color_code: '#FFAA29' },
  },
  day: 6,
  date: chargeDate,
  recurrence_period: 'MONTHLY',
  is_paid: true,
  is_forecast: false,
  ...overrides,
});

const renderScreen = () => {
  mockUseSubscriptionPaymentsQuery.mockReturnValue({
    data: mockPayments,
    isLoading: false,
  });
  return render(
    <ThemeProvider theme={lightTheme}>
      <SubscriptionPayments />
    </ThemeProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPayments = [];
});

describe('SubscriptionPayments actual and forecast rows (SSI-37..39)', () => {
  it('keeps actual same-day charges distinct and renders a forecast separately', () => {
    mockPayments = [
      makePayment({ transaction_id: 101 }),
      makePayment({ transaction_id: 102 }),
      makePayment({
        transaction_id: null,
        date: '2026-08-13T12:00:00.000Z',
        is_paid: false,
        is_forecast: true,
      }),
    ];
    const screen = renderScreen();

    expect(screen.getAllByText('Netflix')).toHaveLength(3);
    expect(screen.getByTestId('paid-101').props.children).toBe('true');
    expect(screen.getByTestId('paid-102').props.children).toBe('true');
    expect(screen.getByTestId('paid-pending').props.children).toBe('false');

    const list = screen.UNSAFE_getByType(FlatList);
    const keys = mockPayments.map((payment) => list.props.keyExtractor(payment));
    expect(new Set(keys).size).toBe(3);
  });

  it('navigates with the exact synced UUID without numeric coercion', () => {
    mockPayments = [makePayment()];
    const screen = renderScreen();

    fireEvent.press(screen.getByTestId(`payment-${seriesId}-101`));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/options/subscriptionDetails',
      params: { id: seriesId },
    });
  });

  it('preserves manual pending payment behavior and string manual navigation', () => {
    mockPayments = [
      makePayment({
        subscription_id: '42',
        source: 'MANUAL',
        transaction_id: null,
        is_paid: false,
        is_forecast: false,
      }),
    ];
    const screen = renderScreen();

    expect(screen.getByTestId('paid-pending').props.children).toBe('false');
    fireEvent.press(screen.getByTestId('payment-42-pending'));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/options/subscriptionDetails',
      params: { id: '42' },
    });
  });

  it('keeps the existing empty-period copy', () => {
    const screen = renderScreen();

    expect(
      screen.getByText('Nenhum pagamento previsto neste período.')
    ).toBeTruthy();
  });
});
