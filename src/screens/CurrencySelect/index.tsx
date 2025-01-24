import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

import { CurrencyProps } from '@interfaces/currencies';

import { ListItem } from '@components/ListItem';
import { Gradient } from '@components/Gradient';
import { ListSeparator } from '@components/ListSeparator';

import { currencies } from '@utils/currencies';

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
  function handleCurrencySelect(currency: CurrencyProps) {
    setCurrency(currency);
    closeSelectCurrency();
  }

  return (
    <Container>
      <Gradient />

      <FlatList
        data={currencies}
        keyExtractor={(item) => item.id}
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
  );
}
