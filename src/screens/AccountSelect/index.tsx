import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  Account,
  NameContainer,
  Name,
  CurrencyContainer,
  Currency,
  Simbol,
  Footer,
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { AccountProps } from '@components/AccountListItem';
import { ListSeparator } from '@components/ListSeparator';
import { Button } from '@components/Form/Button';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

type Props = {
  account: AccountProps;
  setAccount: (account: AccountProps) => void;
  closeSelectAccount: () => void;
}

export function AccountSelect({
  account,
  setAccount,
  closeSelectAccount
}: Props) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useSelector(selectUserTenantId);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('account', {
        params: {
          tenant_id: tenantId
        }
      });
      if (!data) {
      } else {
        setAccounts(data);
      }

      setLoading(false);
      setRefreshing(false)
    } catch (error) {
      console.error(error);
      Alert.alert("Contas", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.");

      setLoading(false);
      setRefreshing(false)
    }
  };

  function handleAccountSelect(account: AccountProps) {
    setAccount(account);
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  useFocusEffect(useCallback(() => {
    fetchAccounts();
  }, []));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Account
            onPress={() => handleAccountSelect(item)}
            isActive={account.id === item.id}
          >
            <NameContainer>
              <Name>{item.name}</Name>
            </NameContainer>
            <CurrencyContainer>
              <Currency>{item.currency}</Currency>
              <Simbol>{item.simbol}</Simbol>
            </CurrencyContainer>
          </Account>
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
        }
        style={{ flex: 1, width: '100%' }}
      />

      <Footer>
        <Button
          type='secondary'
          title="Selecionar"
          onPress={closeSelectAccount}
        />
      </Footer>
    </Container>
  )
}