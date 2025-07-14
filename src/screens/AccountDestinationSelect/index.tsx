import React from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { Screen } from '@components/Screen';
import { ListItem } from '@components/ListItem';
import { Gradient } from '@components/Gradient';
import { ListSeparator } from '@components/ListSeparator';
import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

import { useUser } from '@storage/userStorage';

import { AccountProps } from '@interfaces/accounts';

import { useAccountsQuery } from '@hooks/useAccountsQuery';

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
  const { id: userID } = useUser();
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isRefetching: isRefetchingAccounts,
  } = useAccountsQuery(userID);

  function handleRefresh() {
    refetchAccounts();
  }

  function handleAccountSelect(account: AccountProps) {
    setAccountDestination(account);
    closeSelectAccountDestination();
  }

  if (isLoadingAccounts) {
    return <Load />;
  }

  return (
    <Screen>
      <Container>
        <Gradient />

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
            <RefreshControl
              refreshing={isRefetchingAccounts}
              onRefresh={handleRefresh}
            />
          }
          style={{ flex: 1, width: '100%' }}
        />
      </Container>
    </Screen>
  );
}
