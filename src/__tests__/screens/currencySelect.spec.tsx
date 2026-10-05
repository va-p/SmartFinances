import React from 'react';

import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';

import { CurrencySelect } from '@screens/CurrencySelect';
import { useCurrenciesStore } from '@stores/currenciesStore';

import { CurrencyProps } from '@interfaces/currencies';

// jest.mock factories cannot close over module scope, so they require()
// their dependencies - standard jest pattern, hence the scoped disables.
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
jest.mock('@components/ListItem', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');

  return {
    ListItem: ({ data, isActive, onPress }: any) => (
      <TouchableOpacity
        testID={`currency-row-${data.id}${isActive ? '-active' : ''}`}
        onPress={onPress}
      />
    ),
  };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as CurrencyProps;
const btc = { id: 2, name: 'Bitcoin', code: 'BTC', symbol: '₿' } as CurrencyProps;
const eur = { id: 3, name: 'Euro', code: 'EUR', symbol: '€' } as CurrencyProps;
const usd = { id: 5, name: 'US Dollar', code: 'USD', symbol: '$' } as CurrencyProps;
const eth = { id: 4, name: 'Ethereum', code: 'ETH', symbol: 'Ξ' } as CurrencyProps;

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

const seedStore = (currencies: CurrencyProps[]) =>
  useCurrenciesStore.getState().setCurrencies(currencies);

describe('CurrencySelect items override', () => {
  beforeEach(() => {
    seedStore([brl, btc, eur, usd, eth]);
  });

  // BC-05 — the host (base-currency sheet) supplies the candidate list;
  // the override replaces the store list entirely
  it('renders the provided items instead of the store list', () => {
    const screen = renderWithTheme(
      <CurrencySelect
        currency={brl}
        setCurrency={jest.fn()}
        closeSelectCurrency={jest.fn()}
        items={[brl, usd]}
      />
    );

    expect(screen.getByTestId('currency-row-1-active')).toBeTruthy();
    expect(screen.getByTestId('currency-row-5')).toBeTruthy();

    // store-only entries and unsupported entries are absent
    expect(screen.queryByTestId('currency-row-2')).toBeNull();
    expect(screen.queryByTestId('currency-row-3')).toBeNull();
    expect(screen.queryByTestId('currency-row-4')).toBeNull();
  });

  // Default path — RegisterAccount behavior unchanged: store list renders
  it('renders the currencies store list when no items are provided', () => {
    const screen = renderWithTheme(
      <CurrencySelect
        currency={brl}
        setCurrency={jest.fn()}
        closeSelectCurrency={jest.fn()}
      />
    );

    expect(screen.getByTestId('currency-row-1-active')).toBeTruthy();
    [btc, eur, usd, eth].forEach((currency) => {
      expect(screen.getByTestId(`currency-row-${currency.id}`)).toBeTruthy();
    });
  });

  // BC-15 — the current currency is the marked-active row
  it('marks the current currency row as active', () => {
    const screen = renderWithTheme(
      <CurrencySelect
        currency={usd}
        setCurrency={jest.fn()}
        closeSelectCurrency={jest.fn()}
        items={[brl, usd]}
      />
    );

    expect(screen.getByTestId('currency-row-5-active')).toBeTruthy();
    expect(screen.getByTestId('currency-row-1')).toBeTruthy();
    expect(screen.queryByTestId('currency-row-1-active')).toBeNull();
  });

  // BC-06 — selecting applies the currency and closes the sheet flow
  it('selects the tapped currency and then closes', () => {
    const setCurrency = jest.fn();
    const closeSelectCurrency = jest.fn();

    const screen = renderWithTheme(
      <CurrencySelect
        currency={brl}
        setCurrency={setCurrency}
        closeSelectCurrency={closeSelectCurrency}
        items={[brl, usd]}
      />
    );

    fireEvent.press(screen.getByTestId('currency-row-5'));

    expect(setCurrency).toHaveBeenCalledTimes(1);
    expect(setCurrency).toHaveBeenCalledWith(usd);
    expect(closeSelectCurrency).toHaveBeenCalledTimes(1);
    expect(setCurrency.mock.invocationCallOrder[0]).toBeLessThan(
      closeSelectCurrency.mock.invocationCallOrder[0]
    );
  });
});
