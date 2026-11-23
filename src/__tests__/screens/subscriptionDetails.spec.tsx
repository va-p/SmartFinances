import React from 'react';
import { Alert } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { SubscriptionDetails } from '@screens/SubscriptionDetails';
import { useSubscriptionDetailQuery } from '@hooks/useSubscriptionDetailQuery';

import { SubscriptionProps } from '@interfaces/subscriptions';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
const mockManualMutate = jest.fn();
const mockSyncedMutate = jest.fn();
const mockRefetch = jest.fn();
const mockRouterBack = jest.fn();
const mockEditModal = { present: jest.fn(), dismiss: jest.fn() };

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (component: any) => component },
    Easing: { inOut: () => () => undefined, quad: {} },
    FadeInUp: { duration: () => ({}) },
    FadeOutUp: { duration: () => ({}) },
    interpolate: (value: number) => value,
    useAnimatedStyle: (updater: () => object) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
  };
});

jest.mock('@hooks/useSubscriptionDetailQuery', () => ({
  useSubscriptionDetailQuery: jest.fn(),
}));
jest.mock('@hooks/useSubscriptionMutations', () => ({
  useUpdateSubscriptionMutation: () => ({
    mutate: mockManualMutate,
    isPending: false,
  }),
  useUpdateSyncedSubscriptionMutation: () => ({
    mutate: mockSyncedMutate,
    isPending: false,
  }),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'route-id' }),
  useRouter: () => ({ back: mockRouterBack }),
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
jest.mock('@components/Button', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    Button: {
      Root: ({ children, onPress }: any) => (
        <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
      ),
      Text: ({ text }: any) => <Text>{text}</Text>,
    },
  };
});
jest.mock('@components/Modals/ModalViewSelection', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    ModalViewSelection: ({ bottomSheetRef, children, title }: any) => {
      React.useImperativeHandle(bottomSheetRef, () => mockEditModal, []);
      return (
        <View>
          <Text>{title}</Text>
          {children}
        </View>
      );
    },
  };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const mockUseSubscriptionDetailQuery = useSubscriptionDetailQuery as jest.Mock;
const seriesId = '7b386a1c-91ef-43ed-a9f4-fcf8a74f02db';

const makeSubscription = (
  overrides: Partial<SubscriptionProps> = {}
): SubscriptionProps => ({
  id: seriesId,
  source: 'SYNCED',
  transaction_id: null,
  description: 'Netflix',
  amount: 55.9,
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  category: {
    id: 'cat-1',
    name: 'Streaming',
    icon: { id: 'icon-1', name: 'play' },
    color: { id: 'color-1', color_code: '#FFAA29' },
  },
  recurrence_period: null,
  recurrence_interval: null,
  day: 6,
  next_payment_at: null,
  last_payment_at: '2026-07-06T12:00:00.000Z',
  is_subscription: true,
  hide_from_subscription_list: false,
  ...overrides,
});

const renderDetails = (subscription: SubscriptionProps) => {
  mockUseSubscriptionDetailQuery.mockReturnValue({
    data: subscription,
    isLoading: false,
    refetch: mockRefetch,
  });
  return render(
    <ThemeProvider theme={lightTheme}>
      <SubscriptionDetails />
    </ThemeProvider>
  );
};

const confirmDismissal = () => {
  const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
  alertCall[2][1].onPress();
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SubscriptionDetails synced series management (SSI-17/18/20/35/36)', () => {
  it('shows exact no-forecast copy and hides legacy edit controls and modal', () => {
    const screen = renderDetails(makeSubscription());

    expect(screen.getByText('Sem previsão da próxima cobrança')).toBeTruthy();
    expect(screen.queryByText('Editar')).toBeNull();
    expect(screen.queryByText('Editar assinatura')).toBeNull();
    expect(screen.queryByText('Salvar')).toBeNull();
  });

  it('keeps the normal recurrence label when a synced forecast exists', () => {
    const screen = renderDetails(
      makeSubscription({
        recurrence_period: 'MONTHLY',
        recurrence_interval: 1,
        next_payment_at: '2026-08-06T12:00:00.000Z',
      })
    );

    expect(screen.getByText('Mensal')).toBeTruthy();
    expect(screen.queryByText('Sem previsão da próxima cobrança')).toBeNull();
  });

  it('dismisses a synced series by UUID and navigates back on success', () => {
    mockSyncedMutate.mockImplementation((_payload, options) => options.onSuccess());
    const screen = renderDetails(makeSubscription());

    fireEvent.press(screen.getByText('Não é uma assinatura'));
    confirmDismissal();

    expect(mockSyncedMutate).toHaveBeenCalledWith(
      { id: seriesId, is_subscription: false },
      { onSuccess: expect.any(Function) }
    );
    expect(mockManualMutate).not.toHaveBeenCalled();
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('hides a synced series by UUID without disabling its subscription', () => {
    mockSyncedMutate.mockImplementation((_payload, options) => options.onSuccess());
    const screen = renderDetails(makeSubscription());

    fireEvent.press(screen.getByText('Ocultar da lista'));

    expect(mockSyncedMutate).toHaveBeenCalledWith(
      { id: seriesId, hide_from_subscription_list: true },
      { onSuccess: expect.any(Function) }
    );
    expect(mockManualMutate).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('restores synced list visibility with an explicit false flag', () => {
    const screen = renderDetails(
      makeSubscription({ hide_from_subscription_list: true })
    );

    fireEvent.press(screen.getByText('Exibir na lista'));

    expect(mockSyncedMutate).toHaveBeenCalledWith(
      { id: seriesId, hide_from_subscription_list: false },
      { onSuccess: expect.any(Function) }
    );
  });

  it('keeps manual dismissal on the numeric transaction ID', () => {
    mockManualMutate.mockImplementation((_payload, options) => options.onSuccess());
    const screen = renderDetails(
      makeSubscription({
        id: '42',
        source: 'MANUAL',
        transaction_id: 42,
        recurrence_period: 'MONTHLY',
        recurrence_interval: 1,
      })
    );

    fireEvent.press(screen.getByText('Não é uma assinatura'));
    confirmDismissal();

    expect(mockManualMutate).toHaveBeenCalledWith(
      { transaction_id: 42, is_subscription: false },
      { onSuccess: expect.any(Function) }
    );
    expect(mockSyncedMutate).not.toHaveBeenCalled();
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('keeps manual visibility updates on the numeric transaction ID', () => {
    const screen = renderDetails(
      makeSubscription({
        id: '42',
        source: 'MANUAL',
        transaction_id: 42,
        recurrence_period: 'MONTHLY',
        recurrence_interval: 1,
      })
    );

    fireEvent.press(screen.getByText('Ocultar da lista'));

    expect(mockManualMutate).toHaveBeenCalledWith(
      { transaction_id: 42, hide_from_subscription_list: true },
      { onSuccess: expect.any(Function) }
    );
    expect(mockSyncedMutate).not.toHaveBeenCalled();
  });

  it('retains the manual amount/day/recurrence editor', () => {
    const screen = renderDetails(
      makeSubscription({
        id: '42',
        source: 'MANUAL',
        transaction_id: 42,
        recurrence_period: 'MONTHLY',
        recurrence_interval: 1,
      })
    );

    fireEvent.press(screen.getByText('Editar'));
    fireEvent.press(screen.getByText('Salvar'));

    expect(mockEditModal.present).toHaveBeenCalledTimes(1);
    expect(mockManualMutate).toHaveBeenCalledWith(
      {
        transaction_id: 42,
        amount: 55.9,
        transaction_date: expect.any(String),
        recurrence_period: 'MONTHLY',
      },
      { onSuccess: expect.any(Function) }
    );
    expect(mockSyncedMutate).not.toHaveBeenCalled();
  });
});
