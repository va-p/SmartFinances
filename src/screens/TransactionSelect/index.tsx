import React, { useMemo, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { useForm } from 'react-hook-form';
import { FlatList } from 'react-native-gesture-handler';

// Components
import { Header } from '@components/Header';
import { SearchBar } from '@components/SearchBar';
import { ListSeparator } from '@components/ListSeparator';
import { Load } from '@components/Button/components/Load';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

// Hooks
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

// Storages
import { useUserConfigs } from '@stores/userConfigsStorage';

// Utils
import { selectSubscriptionCandidates } from '@utils/subscriptionDesignation';

// Interfaces
import { TagProps } from '@components/TagListItem';
import { TransactionProps } from '@interfaces/transactions';

function EmptyList() {
  return (
    <ListEmptyComponent text='Nenhuma transação elegível. Apenas transações de crédito ou débito ainda não classificadas como assinatura podem ser selecionadas.' />
  );
}

type Props = {
  setTransaction: (transaction: TransactionProps) => void;
  closeSelectTransaction: () => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  /**
   * Override the candidate list (transfer-correction TRC-19). Defaults to
   * the subscription candidates so existing callers behave identically.
   * Counterpart mode passes a `selectCounterpartCandidates`-based filter.
   */
  candidatesFilter?: (transactions: TransactionProps[]) => TransactionProps[];
};

/**
 * Picker for designating a subscription from existing transactions:
 * only credit/debit transactions not yet classified (SD-06), including
 * bank/credit-card synced imports.
 */
export function TransactionSelect({
  setTransaction,
  closeSelectTransaction,
  disabled = false,
  closeOnSelect = true,
  candidatesFilter = selectSubscriptionCandidates,
}: Props) {
  const { hideAmount } = useUserConfigs();
  const {
    data: transactions,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTransactionsQuery();
  const [showSearchInput, setShowSearchInput] = useState(false);

  const { control, watch, reset } = useForm();
  const searchQuery = watch('search', '');

  const candidates = useMemo(
    () => candidatesFilter(transactions ?? []),
    [candidatesFilter, transactions]
  );

  // Transaction filtering with search
  const filteredCandidates = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (!normalizedQuery) {
      return candidates;
    }

    return candidates.filter((transaction) => {
      const searchableText = [
        transaction.description,
        transaction.category?.name,
        transaction.tags?.map((tag: TagProps) => tag.name).join(' '),
        String(transaction.amount),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return searchableText.includes(normalizedQuery);
    });
  }, [candidates, searchQuery]);

  function handleRefresh() {
    refetch();
  }

  function handleTransactionSelect(transaction: TransactionProps) {
    if (disabled) return;
    setTransaction(transaction);
    if (closeOnSelect) closeSelectTransaction();
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

  return (
    <Container>
      <Header.Root justifyContent='space-between'>
        <Header.Title title='Selecione a transação' numberOfLines={1} />
        <Header.SearchButton
          onPress={() => {
            setShowSearchInput((prevState) => {
              if (prevState) reset();
              return !prevState;
            });
          }}
        />
      </Header.Root>

      {showSearchInput && (
        <SearchBar control={control} onClear={() => reset()} />
      )}

      <FlatList
        data={filteredCandidates}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TransactionListItem
            data={item}
            index={index}
            hideAmount={hideAmount}
            onPress={() => handleTransactionSelect(item)}
          />
        )}
        ListEmptyComponent={
          searchQuery.trim() ? (
            <ListEmptyComponent text={`Nenhuma transação encontrada para "${searchQuery}".`} />
          ) : (
            <EmptyList />
          )
        }
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
