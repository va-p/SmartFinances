import React from 'react';
import { RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { ListItem } from '@components/ListItem';
import { ListSeparator } from '@components/ListSeparator';
import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

import { useAccountsQuery } from '@hooks/useAccountsQuery';

import { useGoalAccountsSelected } from '@stores/goalAccountsSelected';

import { AccountProps } from '@interfaces/accounts';

/**
 * Multi-select of real accounts to link to a goal. Virtual reserve accounts
 * (isVirtual) never show up here — they are managed exclusively by the goals
 * flow (GOAL-26).
 */
export function GoalAccountSelect() {
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isRefetching: isRefetchingAccounts,
  } = useAccountsQuery();

  const goalAccountsSelected = useGoalAccountsSelected(
    (state) => state.goalAccountsSelected
  );
  const setGoalAccountsSelected = useGoalAccountsSelected(
    (state) => state.setGoalAccountsSelected
  );

  const selectableAccounts = (accounts ?? []).filter(
    (account) => !account.isVirtual
  );

  function handleToggleAccount(account: AccountProps) {
    const alreadySelected = goalAccountsSelected.some(
      (item) => item.id === account.id
    );

    if (!alreadySelected) {
      setGoalAccountsSelected(goalAccountsSelected.concat(account));
    } else {
      setGoalAccountsSelected(
        goalAccountsSelected.filter((item) => item.id !== account.id)
      );
    }
  }

  if (isLoadingAccounts) {
    return <Load />;
  }

  return (
    <Container>
      <FlatList
        data={selectableAccounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            isActive={goalAccountsSelected.some(
              (account) => account.id === item.id
            )}
            onPress={() => handleToggleAccount(item)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma conta disponível. Crie contas antes de vinculá-las às suas metas.' />
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
