import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Category,
  Icon,
  Name,
  Separator,
  Footer,
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import { Button } from '@components/Form/Button';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export interface CategoryProps {
  id: string;
  created_at: string;
  key: string;
  name: string;
  icon?: string;
  color?: string;
  tenant_id: string;
}

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
  const tenantId = useSelector(selectUserTenantId);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
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

  return (
    <Container>
      <FlatList
        data={categories}
        style={{ flex: 1, width: '100%' }}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Category
            onPress={() => handleCategorySelect(item)}
            isActive={category.id === item.id}
          >
            <Icon name={item.icon} />
            <Name>{item.name}</Name>
          </Category>
        )}
        ItemSeparatorComponent={() => <Separator />}
      />

      <Footer>
        <Button
          title="Selecionar"
          isLoading={buttonIsLoading}
          onPress={closeSelectCategory}
        />
      </Footer>
    </Container>
  )
}