import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  CategoriesContainer,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import {
  CategoryListItem,
  CategoryProps
} from '@components/CategoryListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { RegisterCategory } from '@screens/RegisterCategory';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export function Categories() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [registerCategoryModalOpen, setRegisterCategoryModalOpen] = useState(false);


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

  function handleOpenRegisterCategoryModal() {
    setRegisterCategoryModalOpen(true);
  };

  function handleCloseRegisterCategoryModal() {
    setRegisterCategoryModalOpen(false);
  };

  async function handleCategorySwipeLeft(id: string) {
    Alert.alert("Exclusão de categoria", "Tem certeza que deseja excluir a categoria?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a categoria.", onPress: () => handleDeleteCategory(id) }])
  };

  async function handleDeleteCategory(id: string) {
    try {
      await api.delete('delete_category', {
        params: {
          category_id: id
        }
      });
      Alert.alert("Exclusão de categoria", "Categoria excluída com sucesso!")

      fetchCategories();
    } catch (error) {
      Alert.alert("Exclusão de categoria", `${error}`)
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header type='primary' title='Categorias' />
      
      <CategoriesContainer>
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CategoryListItem
              data={item}
              onSwipeableLeftOpen={() => handleCategorySwipeLeft(item.id)}
            />
          )}
          initialNumToRender={50}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchCategories} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20
          }}
        />
      </CategoriesContainer>

      <Footer>
        <Button
          type='secondary'
          title='Criar nova categoria'
          onPress={handleOpenRegisterCategoryModal}
        />
      </Footer>

      <ModalView
        visible={registerCategoryModalOpen}
        closeModal={handleCloseRegisterCategoryModal}
        title='Criar Nova Categoria'
      >
        <RegisterCategory />
      </ModalView>
    </Container>
  );
}