import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

import { useCurrenciesStore } from '@storage/currenciesStore';

import { Screen } from '@components/Screen';
import { ListItem } from '@components/ListItem';
import { Gradient } from '@components/Gradient';
import { ListSeparator } from '@components/ListSeparator';

import { CurrencyProps } from '@interfaces/currencies';

type Props = {
  currency: CurrencyProps;
  setCurrency: (currency: CurrencyProps) => void;
  closeSelectCurrency: () => void;
};

export function CurrencySelect({
  currency,
  setCurrency,
  closeSelectCurrency,
}: Props) {
  const currencies = useCurrenciesStore((state) => state.currencies);

  function handleCurrencySelect(currency: CurrencyProps) {
    setCurrency(currency);
    closeSelectCurrency();
  }

  return (
    <Screen>
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
          ItemSeparatorComponent={() => <ListSeparator />}
          style={{ flex: 1, width: '100%' }}
        />
      </Container>
    </Screen>
  );
}
