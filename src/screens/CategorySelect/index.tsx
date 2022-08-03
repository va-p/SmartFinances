import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  Category,
  Icon,
  Name,
  Footer,
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { CategoryProps } from '@components/CategoryListItem';
import { ListSeparator } from '@components/ListSeparator';
import { Button } from '@components/Form/Button';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

type Props = {
  category: CategoryProps;
  setCategory: (category: CategoryProps) => void;
  closeSelectCategory: () => void;
}

export function CategorySelect({
  category,
  setCategory,
  closeSelectCategory
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
          tenant_id: tenantId
        }
      });
      if (!data) {
      } else {
        setCategories(data);
        setRefreshing(false);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Categorias", "Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleCategorySelect(category: CategoryProps) {
    setCategory(category);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useFocusEffect(useCallback(() => {
    fetchCategories();
  }, []));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Category
            color={item.color.hex}
            onPress={() => handleCategorySelect(item)}
            isActive={category.id === item.id}
          >
            <Icon name={item.icon?.name} />
            <Name>{item.name}</Name>
          </Category>
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCategories} />
        }
        style={{ flex: 1, width: '100%' }}
      />

      <Footer>
        <Button
          type='secondary'
          title="Selecionar"
          onPress={closeSelectCategory}
        />
      </Footer>
    </Container>
  )
}