import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { CategoryListItemRegisterTransaction } from '@components/CategoryListItemRegisterTransaction';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryProps } from '@components/CategoryListItem';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useSelector(selectUserTenantId);
  const [categories, setCategories] = useState<CategoryProps[]>([]);

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

  function handleCategorySelect(category: CategoryProps) {
    setCategory(category);
    closeSelectCategory();
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
            isChecked={categorySelected.id === item.id}
            onPress={() => handleCategorySelect(item)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma categoria criada ainda. Crie categorias para adicioná-las às transações.' />
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
