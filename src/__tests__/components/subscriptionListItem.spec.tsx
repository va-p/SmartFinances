import React from 'react';

import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import lightTheme from '@themes/lightTheme';
import { SubscriptionListItem } from '@components/SubscriptionListItem';

import { SubscriptionProps } from '@interfaces/subscriptions';

const makeSubscription = (
  overrides: Partial<SubscriptionProps> = {}
): SubscriptionProps => ({
  id: '7b386a1c-91ef-43ed-a9f4-fcf8a74f02db',
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

const renderItem = (data: SubscriptionProps) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <SubscriptionListItem data={data} index={0} />
    </ThemeProvider>
  );

describe('SubscriptionListItem synced forecast display (SSI-35/SSI-36)', () => {
  it('renders the exact no-forecast message when synced periodicity is null', () => {
    const screen = renderItem(makeSubscription());

    expect(screen.getByText('Sem previsão da próxima cobrança')).toBeTruthy();
  });

  it('renders the existing recurrence label when a synced forecast exists', () => {
    const screen = renderItem(
      makeSubscription({
        recurrence_period: 'MONTHLY',
        recurrence_interval: 1,
        next_payment_at: '2026-08-06T12:00:00.000Z',
      })
    );

    expect(screen.getByText('Mensal · Dia 6')).toBeTruthy();
    expect(screen.queryByText('Sem previsão da próxima cobrança')).toBeNull();
  });
});
