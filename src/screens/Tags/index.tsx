import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';

import { Header } from '@components/Header_old';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { TagListItem, TagProps } from '@components/TagListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterTag } from '@screens/RegisterTag';

import { useUser } from 'src/storage/userStorage';

import api from '@api/api';

export function Tags() {
  const [loading, setLoading] = useState(false);
  const userID = useUser((state) => state.id);
  const [tags, setTags] = useState<TagProps[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [tagId, setTagId] = useState('');

  async function fetchTags() {
    setLoading(true);

    try {
      const { data } = await api.get('tag', {
        params: {
          user_id: userID,
        },
      });
      if (!data) {
      } else {
        setTags(data);
        setRefreshing(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Etiquetas',
        'Não foi possível buscar as etiquetas. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenRegisterTagModal() {
    setTagId('');
    bottomSheetRef.current?.present();
  }

  function handleCloseRegisterTagModal() {
    bottomSheetRef.current?.dismiss();
  }

  function handleOpenTag(id: string) {
    setTagId(id);
    bottomSheetRef.current?.present();
  }

  function handleCloseEditTag() {
    try {
      setLoading(true);

      setTagId('');
      fetchTags();
      bottomSheetRef.current?.dismiss();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTag(id: string) {
    try {
      await api.delete('tag/delete', {
        params: {
          tag_id: id,
        },
      });
      Alert.alert('Exclusão de etiqueta', 'Etiqueta excluída com sucesso!');
      handleCloseEditTag();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Exclusão de etiqueta', error.response?.data.message, [
          { text: 'Tentar novamente' },
          {
            text: 'Voltar para a tela anterior',
            onPress: handleCloseRegisterTagModal,
          },
        ]);
      }
    }
  }

  async function handleClickDeleteTag() {
    Alert.alert(
      'Exclusão de etiqueta',
      'Tem certeza que deseja excluir a etiqueta?',
      [
        { text: 'Não, cancelar a exclusão.' },
        {
          text: 'Sim, excluir a etiqueta.',
          onPress: () => handleDeleteTag(tagId),
        },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, [])
  );

  if (loading) {
    return <SkeletonCategoriesAndTagsScreen />;
  }

  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Etiquetas'} />
      </Header.Root>

      <FlatList
        data={tags}
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchTags} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Footer>
        <Button.Root type='secondary' onPress={handleOpenRegisterTagModal}>
          <Button.Text type='secondary' text='Criar Nova Etiqueta' />
        </Button.Root>
      </Footer>

      <ModalView
        type={tagId !== '' ? 'secondary' : 'primary'}
        title={tagId !== '' ? 'Editar Etiqueta' : 'Criar Nova Etiqueta'}
        bottomSheetRef={bottomSheetRef}
        snapPoints={['50%']}
        closeModal={handleCloseRegisterTagModal}
        deleteChildren={handleClickDeleteTag}
      >
        <RegisterTag id={tagId} closeTag={handleCloseEditTag} />
      </ModalView>
    </Container>
  );
}
