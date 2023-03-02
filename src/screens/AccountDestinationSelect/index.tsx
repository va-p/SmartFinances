import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { AccountProps } from '@components/AccountListItem';
import { ListSeparator } from '@components/ListSeparator';
import { ListItem } from '@components/ListItem';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

type Props = {
  accountDestination: AccountProps;
  setAccountDestination: (accountDestination: AccountProps) => void;
  closeSelectAccountDestination: () => void;
};

export function AccountDestinationSelect({
  accountDestination,
  setAccountDestination,
  closeSelectAccountDestination,
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
          tenant_id: tenantId,
        },
      });
      if (!data) {
      } else {
        setAccounts(data);
        setRefreshing(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Contas',
        'Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleAccountSelect(account: AccountProps) {
    setAccountDestination(account);
    closeSelectAccountDestination();
  }

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  if (loading) {
    return <Load />;
  }

  return (
    <Container>
      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            isActive={accountDestination.id === item.id}
            onPress={() => handleAccountSelect(item)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma conta criada ainda. Crie suas contas antes de adicionar as transações.' />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
        }
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
