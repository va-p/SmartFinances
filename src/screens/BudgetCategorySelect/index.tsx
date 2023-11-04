import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { CategoryListItemRegisterTransaction } from '@components/CategoryListItemRegisterTransaction';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryProps } from '@components/CategoryListItem';
import { Load } from '@components/Load';

import {
  selectBudgetCategoriesSelected,
  setBudgetCategoriesSelected,
} from '@slices/budgetCategoriesSelectedSlice';
import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export function BudgetCategorySelect() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useSelector(selectUserTenantId);

  const [categories, setCategories] = useState<CategoryProps[]>([]);

  const categoriesAlreadySelected = useSelector(selectBudgetCategoriesSelected);

  const dispatch = useDispatch();

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
      categoriesAlreadySelected.includes(category);

    if (!categoryAlreadySelected) {
      const updatedCategoriesAlreadySelected =
        categoriesAlreadySelected.concat(category);
      dispatch(setBudgetCategoriesSelected(updatedCategoriesAlreadySelected));
    } else {
      const updatedCategoriesAlreadySelected = categoriesAlreadySelected.filter(
        (item) => item.id !== category.id
      );
      dispatch(setBudgetCategoriesSelected(updatedCategoriesAlreadySelected));
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
            isChecked={categoriesAlreadySelected.find(
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
