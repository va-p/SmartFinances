import React from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { ListItem } from '@components/ListItem';
import { ListSeparator } from '@components/ListSeparator';
import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useSelectedAccountsFilter } from '@stores/selectedAccountsFilterStorage';

import { AccountProps } from '@interfaces/accounts';

/**
 * Multi-select of accounts for the Home accounts filter. Toggling applies
 * the filter immediately; the sheet is dismissed by backdrop/pan, not by
 * selection (GoalAccountSelect pattern).
 */
export function AccountFilterSelect() {
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isRefetching: isRefetchingAccounts,
    isError,
  } = useAccountsQuery();

  const selectedAccountsFilter = useSelectedAccountsFilter(
    (state) => state.selectedAccountsFilter
  );
  const setSelectedAccountsFilter = useSelectedAccountsFilter(
    (state) => state.setSelectedAccountsFilter
  );

  function handleToggleAccount(account: AccountProps) {
    const alreadySelected = selectedAccountsFilter.some(
      (item) => item.id === account.id
    );

    if (!alreadySelected) {
      setSelectedAccountsFilter(selectedAccountsFilter.concat(account));
    } else {
      setSelectedAccountsFilter(
        selectedAccountsFilter.filter((item) => item.id !== account.id)
      );
    }
  }

  if (isLoadingAccounts) {
    return <Load />;
  }

  if (isError) {
    Alert.alert(
      'Contas',
      'Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.'
    );
  }

  // Virtual goal reserves are never offered as selectable accounts (GOAL-26).
  const selectableAccounts = (accounts ?? []).filter(
    (account) => !account.isVirtual
  );

  return (
    <Container>
      <FlatList
        data={selectableAccounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            isActive={selectedAccountsFilter.some(
              (account) => account.id === item.id
            )}
            onPress={() => handleToggleAccount(item)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma conta criada ainda.' />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingAccounts}
            onRefresh={refetchAccounts}
          />
        }
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
