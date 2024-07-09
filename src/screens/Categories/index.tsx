import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryListItem } from '@components/CategoryListItem';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterCategory } from '@screens/RegisterCategory';

import { useUser } from '@stores/userStore';

import { CategoryProps } from '@interfaces/categories';

import api from '@api/api';

export function Categories() {
  const [loading, setLoading] = useState(false);
  const tenantId = useUser((state) => state.tenantId);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [categoryId, setCategoryId] = useState('');

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
        setRefreshing(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categorias',
        'Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenRegisterCategoryModal() {
    setCategoryId('');
    bottomSheetRef.current?.present();
  }

  function handleCloseRegisterCategoryModal() {
    bottomSheetRef.current?.dismiss();
  }

  function handleOpenCategory(id: string) {
    setCategoryId(id);
    bottomSheetRef.current?.present();
  }

  function handleCloseEditCategory() {
    setCategoryId('');
    fetchCategories();
    bottomSheetRef.current?.dismiss();
  }

  async function handleDeleteCategory(id: string) {
    try {
      await api.delete('delete_category', {
        params: {
          category_id: id,
        },
      });
      Alert.alert('Exclusão de categoria', 'Categoria excluída com sucesso!');
      handleCloseRegisterCategoryModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Exclusão de categoria', error.response?.data.message, [
          { text: 'Tentar novamente' },
          {
            text: 'Voltar para a tela anterior',
            onPress: handleCloseRegisterCategoryModal,
          },
        ]);
      }
    }
  }

  async function handleClickDeleteCategory() {
    Alert.alert(
      'Exclusão de categoria',
      'ATENÇÃO! Todas as transações desta categoria também serão excluídas. Tem certeza que deseja excluir a categoria?',
      [
        { text: 'Não, cancelar a exclusão' },
        {
          text: 'Sim, excluir a categoria',
          onPress: () => handleDeleteCategory(categoryId),
        },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  if (loading) {
    return <SkeletonCategoriesAndTagsScreen />;
  }

  return (
    <Container>
      <Header type='primary' title='Categorias' />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CategoryListItem
            data={item}
            index={index}
            onPress={() => handleOpenCategory(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma categoria criada. Crie categorias para visualizá-las aqui.' />
        )}
        initialNumToRender={50}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCategories} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Footer>
        <Button
          type='secondary'
          title='Criar Nova Categoria'
          onPress={handleOpenRegisterCategoryModal}
        />
      </Footer>

      <ModalView
        type={categoryId !== '' ? 'secondary' : 'primary'}
        title={categoryId !== '' ? 'Editar Categoria' : 'Criar Nova Categoria'}
        bottomSheetRef={bottomSheetRef}
        enableContentPanningGesture={false}
        snapPoints={['100%']}
        closeModal={
          categoryId !== ''
            ? handleCloseRegisterCategoryModal
            : () => bottomSheetRef.current?.dismiss()
        }
        deleteChildren={handleClickDeleteCategory}
      >
        <RegisterCategory
          id={categoryId}
          closeCategory={handleCloseEditCategory}
        />
      </ModalView>
    </Container>
  );
}
