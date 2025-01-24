import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import getAccounts from '@utils/getAccounts';

import { FlatList } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

import { Load } from '@components/Load';
import { ListItem } from '@components/ListItem';
import { Gradient } from '@components/Gradient';
import { ListSeparator } from '@components/ListSeparator';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

import { useUser } from '@storage/userStorage';

import { AccountProps } from '@interfaces/accounts';

type Props = {
  account: AccountProps;
  setAccount: (account: AccountProps) => void;
  closeSelectAccount: () => void;
};

export function AccountSelect({
  account,
  setAccount,
  closeSelectAccount,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const { id: userID } = useUser();
  const [accounts, setAccounts] = useState<AccountProps[]>([]);

  async function fetchAccounts() {
    setLoading(true);

    try {
      const data = await getAccounts(userID);

      if (!data) {
        return;
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
    setAccount(account);
    closeSelectAccount();
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
      <Gradient />

      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            isActive={account.id === item.id}
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
