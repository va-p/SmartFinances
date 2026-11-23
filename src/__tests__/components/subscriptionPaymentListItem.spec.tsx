import React from 'react';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { SubscriptionPaymentListItem } from '@components/SubscriptionPaymentListItem';

import { SubscriptionPaymentProps } from '@interfaces/subscriptions';

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
jest.mock('@components/SubscriptionAvatar', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    SubscriptionAvatar: ({ isPaid }: { isPaid: boolean }) => (
      <Text testID='payment-paid-status'>{String(isPaid)}</Text>
    ),
  };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const makePayment = (
  overrides: Partial<SubscriptionPaymentProps> = {}
): SubscriptionPaymentProps => ({
  subscription_id: '7b386a1c-91ef-43ed-a9f4-fcf8a74f02db',
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
  date: '2026-08-06T12:00:00.000Z',
  recurrence_period: 'MONTHLY',
  is_paid: true,
  is_forecast: false,
  ...overrides,
});

const renderPayment = (payment: SubscriptionPaymentProps) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <SubscriptionPaymentListItem data={payment} index={0} />
    </ThemeProvider>
  );

describe('SubscriptionPaymentListItem actual and forecast states (SSI-37/38)', () => {
  it('renders an actual imported charge as paid on its actual date and amount', () => {
    const screen = renderPayment(makePayment());

    expect(screen.getByTestId('payment-paid-status').props.children).toBe('true');
    expect(screen.getByText('6 AGO.')).toBeTruthy();
    expect(screen.getByText('R$ 55,90')).toBeTruthy();
  });

  it('renders a forecast as pending without treating it as an actual charge', () => {
    const screen = renderPayment(
      makePayment({
        transaction_id: null,
        date: '2026-09-06T12:00:00.000Z',
        is_paid: false,
        is_forecast: true,
      })
    );

    expect(screen.getByTestId('payment-paid-status').props.children).toBe('false');
    expect(screen.getByText('6 SET.')).toBeTruthy();
    expect(screen.getByText('R$ 55,90')).toBeTruthy();
  });
});
