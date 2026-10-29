import React from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';

// Components
import TransactionListItem from '@components/TransactionListItem';
import { ListSeparator } from '@components/ListSeparator';
import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

// Hooks
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

// Storages
import { useUserConfigs } from '@stores/userConfigsStorage';

// Utils
import { selectSubscriptionCandidates } from '@utils/subscriptionDesignation';

// Interfaces
import { TransactionProps } from '@interfaces/transactions';

type Props = {
  setTransaction: (transaction: TransactionProps) => void;
  closeSelectTransaction: () => void;
};

function EmptyList() {
  return (
    <ListEmptyComponent text='Nenhuma transação elegível. Apenas transações de crédito ou débito ainda não classificadas como assinatura podem ser selecionadas.' />
  );
}

/**
 * Picker for designating a subscription from existing transactions:
 * only credit/debit transactions not yet classified (SD-06), including
 * bank/credit-card synced imports.
 */
export function TransactionSelect({
  setTransaction,
  closeSelectTransaction,
}: Props) {
  const { hideAmount } = useUserConfigs();
  const {
    data: transactions,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTransactionsQuery();

  function handleRefresh() {
    refetch();
  }

  function handleTransactionSelect(transaction: TransactionProps) {
    setTransaction(transaction);
    closeSelectTransaction();
  }

  if (isLoading) {
    return <Load />;
  }

  if (isError) {
    Alert.alert(
      'Transações',
      'Não foi possível buscar as suas transações. Verifique sua conexão com a internet e tente novamente.'
    );
  }

  const candidates = selectSubscriptionCandidates(transactions ?? []);

  return (
    <Container>
      <FlatList
        data={candidates}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TransactionListItem
            data={item}
            index={index}
            hideAmount={hideAmount}
            onPress={() => handleTransactionSelect(item)}
          />
        )}
        ListEmptyComponent={EmptyList}
        ItemSeparatorComponent={ListSeparator}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => handleRefresh()}
          />
        }
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
