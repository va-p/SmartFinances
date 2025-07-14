import React, { useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container } from './styles';

import { useTagsQuery } from '@hooks/useTagsQuery';
import { useDeleteTagMutation } from '@hooks/useTagMutations';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { TagListItem, TagProps } from '@components/TagListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterTag } from '@screens/RegisterTag';

import { useUser } from '@storage/userStorage';

export function Tags() {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const userID = useUser((state) => state.id);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [tagID, setTagID] = useState('');
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const { data: tagsData, isLoading, isError, refetch } = useTagsQuery(userID);
  const { mutate: deleteTag } = useDeleteTagMutation();

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenRegisterTagModal() {
    setTagID('');
    bottomSheetRef.current?.present();
  }

  function handleCloseRegisterTagModal() {
    bottomSheetRef.current?.dismiss();
  }

  function handleOpenTag(id: string) {
    setTagID(id);
    bottomSheetRef.current?.present();
  }

  function handleCloseEditTag() {
    setTagID('');
    bottomSheetRef.current?.dismiss();
  }

  async function handleClickDeleteTag() {
    if (!tagID) return;
    Alert.alert(
      'Exclusão de etiqueta',
      'Tem certeza que deseja excluir a etiqueta?',
      [
        { text: 'Não, cancelar a exclusão.' },
        {
          text: 'Sim, Excluir.',
          style: 'destructive',
          onPress: () =>
            deleteTag(tagID, {
              onSuccess: () => {
                handleCloseEditTag();
              },
              onError: (error) => {
                Alert.alert(
                  'Exclusão de etiqueta',
                  error.response?.data.message,
                  [
                    { text: 'Tentar novamente' },
                    {
                      text: 'Voltar para a tela anterior',
                      onPress: handleCloseRegisterTagModal,
                    },
                  ]
                );
              },
            }),
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

  if (isError) {
    Alert.alert(
      'Etiquetas',
      'Não foi possível buscar as etiquetas. Verifique sua conexão com a internet e tente novamente.'
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title={'Etiquetas'} />
        </Header.Root>

        <FlatList
          data={tagsData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TagListItem
              data={item}
              index={index}
              onPress={() => handleOpenTag(item.id)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma etiqueta criada. Crie etiquetas para visualizá-las aqui.' />
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
              onPress={handleOpenRegisterTagModal}
              style={{ marginTop: 16 }}
            >
              <Button.Text text='Criar Nova Etiqueta' />
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
          type={tagID !== '' ? 'secondary' : 'primary'}
          title={tagID !== '' ? 'Editar Etiqueta' : 'Criar Nova Etiqueta'}
          bottomSheetRef={bottomSheetRef}
          snapPoints={['90%']}
          closeModal={handleCloseRegisterTagModal}
          deleteChildren={handleClickDeleteTag}
        >
          <RegisterTag id={tagID} closeTag={handleCloseEditTag} />
        </ModalView>
      </Container>
    </Screen>
  );
}
