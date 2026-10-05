import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

import { useCurrenciesStore } from '@stores/currenciesStore';

import { ListItem } from '@components/ListItem';
import { Gradient } from '@components/Gradient';
import { ListSeparator } from '@components/ListSeparator';

import { CurrencyProps } from '@interfaces/currencies';

type Props = {
  currency: CurrencyProps;
  setCurrency: (currency: CurrencyProps) => void;
  closeSelectCurrency: () => void;
  // Optional list override: the base-currency sheet passes the
  // quote-supported candidates; defaults to the currencies store list.
  items?: CurrencyProps[];
};

export function CurrencySelect({
  currency,
  setCurrency,
  closeSelectCurrency,
  items = undefined,
}: Props) {
  const storeCurrencies = useCurrenciesStore((state) => state.currencies);
  const currencies = items ?? storeCurrencies;

  function handleCurrencySelect(selectedCurrency: CurrencyProps) {
    setCurrency(selectedCurrency);
    closeSelectCurrency();
  }

  return (
    <Container>
      <Gradient />

      <FlatList
        data={currencies}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            isActive={currency.id === item.id}
            onPress={() => handleCurrencySelect(item)}
          />
        )}
        ItemSeparatorComponent={ListSeparator}
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
