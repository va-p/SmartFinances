import React, { useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryListItemRegisterTransaction } from '@components/CategoryListItemRegisterTransaction';

import { useBudgetCategoriesSelected } from '@stores/budgetCategoriesSelected';

import { useCategoriesQuery } from '@hooks/useCategoriesQuery';

import { CategoryProps } from '@interfaces/categories';

export function BudgetCategorySelect() {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    data: categories,
    isLoading,
    refetch,
    isError,
  } = useCategoriesQuery();

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  const currentCategoriesAlreadySelected = useBudgetCategoriesSelected(
    (state) => state.budgetCategoriesSelected
  );
  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );

  function handleSelectCategory(category: CategoryProps) {
    const categoryAlreadySelected =
      currentCategoriesAlreadySelected.includes(category);

    if (!categoryAlreadySelected) {
      const categoriesAlreadySelectedUpdated =
        currentCategoriesAlreadySelected.concat(category);
      setBudgetCategoriesSelected(categoriesAlreadySelectedUpdated);
    } else {
      const categoriesAlreadySelectedUpdated =
        currentCategoriesAlreadySelected.filter(
          (item) => item.id !== category.id
        );
      setBudgetCategoriesSelected(categoriesAlreadySelectedUpdated);
    }
  }

  if (isLoading) {
    return <Load />;
  }

  if (isError) {
    Alert.alert(
      'Categorias',
      'Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.'
    );
  }

  return (
    <Container>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CategoryListItemRegisterTransaction
            data={item}
            isChecked={currentCategoriesAlreadySelected.find(
              (category) => category.id === item.id
            )}
            onPress={() => handleSelectCategory(item)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma categoria criada ainda. Crie categorias para adicioná-las aos orçamentos.' />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={handleRefresh}
          />
        }
        numColumns={4}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingTop: 12,
          paddingHorizontal: 12,
          paddingBottom: 16,
          rowGap: 8,
        }}
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
