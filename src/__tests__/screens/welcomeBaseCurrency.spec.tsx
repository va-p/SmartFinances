import React from 'react';

import { render, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';

import lightTheme from '@themes/lightTheme';

import { WelcomeBaseCurrency } from '@screens/WelcomeBaseCurrency';
import { WELCOME_STEPS } from '@screens/WelcomeFlow';
import { BaseCurrencySelectSheet } from '@components/BaseCurrencySelectSheet';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useCurrenciesStore } from '@stores/currenciesStore';
import { storageConfig, DATABASE_CONFIGS } from '@database/database';

import { CurrencyProps } from '@interfaces/currencies';

jest.mock('@database/database', () => {
  const set = jest.fn();
  return {
    storageConfig: {
      set,
      getString: jest.fn(),
      getBoolean: jest.fn(),
    },
    storageUser: { set: jest.fn(), getString: jest.fn() },
    storageToken: { set: jest.fn(), getString: jest.fn() },
    DATABASE_USERS: 'user',
    DATABASE_TOKENS: 'token',
    DATABASE_CONFIGS: 'config',
  };
});

// Bottom sheets cannot present() under jest-expo; render the sheet content
// inline and attach present/dismiss spies to the host's ref so the flow's
// wiring (trigger -> present, select -> persist -> dismiss) stays assertable.
// jest.mock is hoisted above the imports by babel-plugin-jest-hoist.
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */
jest.mock('@components/Modals/ModalViewSelection', () => {
  const React = require('react');
  const { View } = require('react-native');
  const present = jest.fn();
  const dismiss = jest.fn();

  function ModalViewSelection({ children, bottomSheetRef }: any) {
    const hostRef = bottomSheetRef;

    React.useEffect(() => {
      hostRef.current = { present, dismiss };
      return () => {
        hostRef.current = null;
      };
    }, [hostRef]);

    return <View>{children}</View>;
  }

  return { ModalViewSelection, presentMock: present, dismissMock: dismiss };
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-shadow */

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as CurrencyProps;
const btc = { id: 2, name: 'Bitcoin', code: 'BTC', symbol: '₿' } as CurrencyProps;
const eur = { id: 3, name: 'Euro', code: 'EUR', symbol: '€' } as CurrencyProps;
const eth = { id: 4, name: 'Ethereum', code: 'ETH', symbol: 'Ξ' } as CurrencyProps;
const usd = { id: 5, name: 'US Dollar', code: 'USD', symbol: '$' } as CurrencyProps;
const usdt = { id: 7, name: 'Tether', code: 'USDT', symbol: '₮' } as CurrencyProps;

// The mocked ModalViewSelection renders the sheet content inline, so the
// current-currency label and the candidate row share the same text; the
// relative requireMock (no alias involved) reaches the mock's spies.
const modalMocks = () =>
  jest.requireMock('../../components/Modals/ModalViewSelection') as {
    presentMock: jest.Mock;
    dismissMock: jest.Mock;
  };

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe('WelcomeBaseCurrency step', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCurrenciesStore
      .getState()
      .setCurrencies([brl, btc, eur, eth, usd, usdt]);
    useUserConfigs.setState(() => ({
      baseCurrency: brl,
    }));
  });

  // BC-12 — the step informs the user about the default currency and shows
  // the current one (BC-04: BRL default). Label + inline sheet row share
  // the text, so presence is asserted through getAllByText.
  it('renders the informative message with the default BRL as current', () => {
    const screen = renderWithTheme(<WelcomeBaseCurrency />);

    expect(screen.getByText(/definir uma moeda padrão/i)).toBeTruthy();
    expect(screen.getAllByText('Brazilian Real').length).toBeGreaterThanOrEqual(1);
  });

  // BC-12 — the selection trigger presents the shared sheet
  it('presents the currency selection sheet from the trigger', () => {
    const screen = renderWithTheme(<WelcomeBaseCurrency />);

    fireEvent.press(screen.getByText('Moeda base'));

    expect(modalMocks().presentMock).toHaveBeenCalledTimes(1);
  });

  // BC-05 — only quote-supported currencies are offered
  it('offers only the supported currencies in the sheet', () => {
    const screen = renderWithTheme(<WelcomeBaseCurrency />);

    fireEvent.press(screen.getByText('Moeda base'));

    expect(screen.getByText('Bitcoin')).toBeTruthy();
    expect(screen.getByText('Euro')).toBeTruthy();
    expect(screen.getByText('US Dollar')).toBeTruthy();

    // ETH/USDT are seeded in the currencies store but cannot back the base
    expect(screen.queryByText('Ethereum')).toBeNull();
    expect(screen.queryByText('Tether')).toBeNull();
  });

  // BC-06 — selecting through the sheet wiring updates the store, persists
  // to MMKV, dismisses the sheet and re-renders the current currency
  it('selects a base currency through the sheet wiring', () => {
    const screen = renderWithTheme(<WelcomeBaseCurrency />);

    // only the candidate row shows the name before selecting (1 occurrence)
    expect(screen.getAllByText('US Dollar').length).toBe(1);

    fireEvent.press(screen.getByText('US Dollar'));

    expect(useUserConfigs.getState().baseCurrency).toEqual(usd);
    expect(storageConfig.set).toHaveBeenCalledWith(
      `${DATABASE_CONFIGS}.baseCurrency`,
      JSON.stringify(usd)
    );
    expect(modalMocks().dismissMock).toHaveBeenCalledTimes(1);

    // candidate row + current-currency label now both show the name (2)
    expect(screen.getAllByText('US Dollar').length).toBe(2);
  });

  // BC-11 — Continuar advances without requiring a selection
  it('calls onNext from the Continuar button without a selection', () => {
    const onNext = jest.fn();
    const screen = renderWithTheme(<WelcomeBaseCurrency onNext={onNext} />);

    fireEvent.press(screen.getByText('Continuar'));

    expect(onNext).toHaveBeenCalledTimes(1);
    // no currency was touched by advancing
    expect(useUserConfigs.getState().baseCurrency).toEqual(brl);
    expect(storageConfig.set).not.toHaveBeenCalled();
  });

  // BC-08 — the step is registered as the first flow step, auth last
  it('is the first step of the default welcome flow', () => {
    expect(WELCOME_STEPS[0].key).toBe('base-currency');
    expect(WELCOME_STEPS[0].Component).toBe(WelcomeBaseCurrency);
    expect(WELCOME_STEPS[WELCOME_STEPS.length - 1].key).toBe('welcome');
  });

  // BC-07 (reactivity) — a store change re-renders the displayed currency
  it('re-renders the current currency when the store changes', () => {
    const screen = renderWithTheme(<WelcomeBaseCurrency />);

    // only the candidate row shows Euro before the change
    expect(screen.getAllByText('Euro').length).toBe(1);

    act(() => {
      useUserConfigs.getState().setBaseCurrency(eur);
    });

    // candidate row + current-currency label now both show Euro
    expect(screen.getAllByText('Euro').length).toBe(2);
  });
});

describe('BaseCurrencySelectSheet wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCurrenciesStore
      .getState()
      .setCurrencies([brl, btc, eur, eth, usd, usdt]);
    useUserConfigs.setState(() => ({
      baseCurrency: brl,
    }));
  });

  // BC-06 — the shared sheet applies the store action, persists and
  // dismisses through the host's ref (the same flow the options menu uses)
  it('applies, persists and dismisses through the host ref on select', () => {
    const screen = renderWithTheme(
      <BaseCurrencySelectSheet bottomSheetRef={{ current: null } as any} />
    );

    fireEvent.press(screen.getByText('US Dollar'));

    expect(useUserConfigs.getState().baseCurrency).toEqual(usd);
    expect(storageConfig.set).toHaveBeenCalledWith(
      `${DATABASE_CONFIGS}.baseCurrency`,
      JSON.stringify(usd)
    );
    expect(modalMocks().dismissMock).toHaveBeenCalledTimes(1);
  });
});
