import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import { Load } from '@components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryListItemRegisterTransaction } from '@components/CategoryListItemRegisterTransaction';

import { useUser } from '@stores/userStore';
import { useBudgetCategoriesSelected } from '@stores/budgetCategoriesSelected';

import { CategoryProps } from '@interfaces/categories';

import api from '@api/api';

export function BudgetCategorySelect() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useUser((state) => state.tenantId);

  const [categories, setCategories] = useState<CategoryProps[]>([]);

  const currentCategoriesAlreadySelected = useBudgetCategoriesSelected(
    (state) => state.budgetCategoriesSelected
  );
  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );

  async function fetchCategories() {
    setLoading(true);

    try {
      const { data } = await api.get('category', {
        params: {
          tenant_id: tenantId,
        },
      });
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categorias',
        'Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

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

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  if (loading) {
    return <Load />;
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchCategories} />
        }
        numColumns={4}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingTop: 12,
          paddingHorizontal: 12,
          paddingBottom: getBottomSpace(),
        }}
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
