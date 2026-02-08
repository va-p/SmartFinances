import React, { useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container } from './styles';

// Hooks
import { useCategoriesQuery } from '@hooks/useCategoriesQuery';
import { useDeleteCategoryMutation } from '@hooks/useCategoryMutations';

// Dependencies
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CategoryListItem } from '@components/CategoryListItem';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterCategory } from '@screens/RegisterCategory';

import { useUser } from '@stores/userStorage';

export function Categories() {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const userID = useUser((state) => state.id);
  const [categoryID, setCategoryID] = useState('');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const {
    data: categories,
    isLoading,
    refetch,
    isRefetching,
  } = useCategoriesQuery(userID);
  const { mutate: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation();

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenRegisterCategoryModal() {
    setCategoryID('');
    bottomSheetRef.current?.present();
  }

  function handleCloseRegisterCategoryModal() {
    bottomSheetRef.current?.dismiss();
  }

  function handleOpenCategory(ID: string) {
    setCategoryID(ID);
    bottomSheetRef.current?.present();
  }

  function handleCloseCategory() {
    setCategoryID('');
    bottomSheetRef.current?.dismiss();
  }

  async function handleClickDeleteCategory() {
    if (!categoryID) return;

    Alert.alert(
      'Exclusão de categoria',
      'ATENÇÃO! Todas as transações desta categoria também serão excluídas. Tem certeza que deseja excluir a categoria?',
      [
        { text: 'Cancelar' },
        {
          text: 'Sim, Excluir',
          style: 'destructive',
          onPress: () => {
            deleteCategory(categoryID, {
              onSuccess: () => {
                handleCloseCategory();
              },
            });
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <SkeletonCategoriesAndTagsScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Categorias' />
        </Header.Root>

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
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListFooterComponent={
            <Button.Root
              onPress={handleOpenRegisterCategoryModal}
              style={{ marginTop: 16 }}
            >
              <Button.Text text='Criar Nova Categoria' />
            </Button.Root>
          }
          ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 8,
            paddingBottom: bottomTabBarHeight + 16,
          }}
          showsVerticalScrollIndicator={false}
        />

        <ModalView
          type={categoryID !== '' ? 'secondary' : 'primary'}
          title={
            categoryID !== '' ? 'Editar Categoria' : 'Criar Nova Categoria'
          }
          bottomSheetRef={bottomSheetRef}
          enableContentPanningGesture={false}
          snapPoints={['90%']}
          closeModal={handleCloseRegisterCategoryModal}
          deleteChildren={handleClickDeleteCategory}
        >
          <RegisterCategory
            id={categoryID}
            closeCategory={handleCloseCategory}
          />
        </ModalView>
      </Container>
    </Screen>
  );
}
