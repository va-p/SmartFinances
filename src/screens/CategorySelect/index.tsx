import React, { useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryListItemRegisterTransaction } from '@components/CategoryListItemRegisterTransaction';

import { CategoryProps } from '@interfaces/categories';

import { useCategoriesQuery } from '@hooks/useCategoriesQuery';

type Props = {
  categorySelected: CategoryProps;
  setCategory: (category: CategoryProps) => void;
  closeSelectCategory: () => void;
};

export function CategorySelect({
  categorySelected,
  setCategory,
  closeSelectCategory,
}: Props) {
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

  function handleCategorySelect(category: CategoryProps) {
    setCategory(category);
    closeSelectCategory();
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
              isChecked={categorySelected.id === item.id}
              onPress={() => handleCategorySelect(item)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma categoria criada ainda. Crie categorias para adicioná-las às transações.' />
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
          }}
          style={{ flex: 1, width: '100%' }}
        />
      </Container>
  );
}
