import React from 'react';
import {
  Container
} from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { CurrencyProps } from '@components/AccountListItem';
import { ListSeparator } from '@components/ListSeparator';
import { ListItem } from '@components/ListItem';


import { currencies } from '@utils/currencies';

type Props = {
  currency: CurrencyProps;
  setCurrency: (currency: CurrencyProps) => void;
  closeSelectCurrency: () => void;
}

export function CurrencySelect({
  currency,
  setCurrency,
  closeSelectCurrency
}: Props) {
  function handleCurrencySelect(currency: CurrencyProps) {
    setCurrency(currency);
    closeSelectCurrency();
  }

  return (
    <Container>
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
  )
}