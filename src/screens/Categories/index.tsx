import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  CategoriesContainer,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';
import { CategoryListItem, CategoryProps } from '@components/CategoryListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Button';
import { Header } from '@components/Header';

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
    } catch (error) {
      console.error(error);
      Alert.alert("Categorias", "Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.");
    } finally {
      setLoading(false);
    };
  };

  function handleOpenRegisterCategoryModal() {
    setRegisterCategoryModalOpen(true);
  };

  function handleCloseRegisterCategoryModal() {
    setCategoryId('');
    setRegisterCategoryModalOpen(false);
    fetchCategories();
  };

  function handleOpenCategory(id: string) {
    setCategoryId(id);
    setRegisterCategoryModalOpen(true);
  };

  async function handleClickDeleteCategory() {
    Alert.alert("Exclusão de categoria", "ATENÇÃO: Todas as transações desta categoria também serão excluídas. Tem certeza que deseja excluir a categoria?", [{ text: "Não, cancelar a exclusão" }, { text: "Sim, excluir a categoria", onPress: () => handleDeleteCategory(categoryId) }])
  };

  async function handleDeleteCategory(id: string) {
    try {
      await api.delete('delete_category', {
        params: {
          category_id: id
        }
      });
      Alert.alert("Exclusão de categoria", "Categoria excluída com sucesso!")
      handleCloseRegisterCategoryModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Exclusão de categoria", error.response?.data.message, [{ text: "Tentar novamente" }, { text: "Voltar para a tela anterior", onPress: handleCloseRegisterCategoryModal }]);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  if (loading) {
    return <SkeletonCategoriesAndTagsScreen />
  }

  return (
    <Container>
      <Header type='primary' title="Categorias" />

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
          ListEmptyComponent={() => (
            <ListEmptyComponent text="Nenhuma categoria criada. Crie categorias para visualizá-las aqui." />
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
        type={categoryId != '' ? 'secondary' : 'primary'}
        title={categoryId != '' ? "Editar Categoria" : "Criar Nova Categoria"}
        visible={registerCategoryModalOpen}
        closeModal={handleCloseRegisterCategoryModal}
        deleteChildren={handleClickDeleteCategory}
      >
        <RegisterCategory
          id={categoryId}
          closeCategory={handleCloseRegisterCategoryModal}
        />
      </ModalView>
    </Container>
  );
}