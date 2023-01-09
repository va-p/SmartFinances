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
  const [categoryId, setCategoryId] = useState('');

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
    setCategoryId('');
    setRegisterCategoryModalOpen(false);
  };

  function handleOpenCategory(id: string) {
    console.log(categoryId);
    setCategoryId(id);
    setRegisterCategoryModalOpen(true);
  };

  function ClearTransactionId() {
    setCategoryId('');
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
              onPress={() => handleOpenCategory(item.id)}
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
          title='Criar Nova Categoria'
          onPress={handleOpenRegisterCategoryModal}
        />
      </Footer>

      <ModalView
        visible={registerCategoryModalOpen}
        closeModal={handleCloseRegisterCategoryModal}
        title={categoryId != '' ? 'Editar Categoria' : 'Criar Nova Categoria'}
      >
        <RegisterCategory
          closeRegisterCategory={handleCloseRegisterCategoryModal}
          id={categoryId}
          setId={ClearTransactionId}
        />
      </ModalView>
    </Container>
  );
}