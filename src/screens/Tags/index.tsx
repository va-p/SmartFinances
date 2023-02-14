import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { TagListItem, TagProps } from '@components/TagListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Button';
import { Header } from '@components/Header';

import { RegisterTag } from '@screens/RegisterTag';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export function Tags() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [tags, setTags] = useState<TagProps[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [tagId, setTagId] = useState('');

  async function fetchTags() {
    setLoading(true);

    try {
      const { data } = await api.get('tag', {
        params: {
          tenant_id: tenantId
        }
      });
      if (!data) {
      } else {
        setTags(data);
        setRefreshing(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Etiquetas", "Não foi possível buscar as etiquetas. Verifique sua conexão com a internet e tente novamente.");
    } finally {
      setLoading(false);
    };
  };

  function handleOpenRegisterTagModal() {
    setTagId('');
    bottomSheetRef.current?.present();
  };

  function handleCloseRegisterTagModal() {
    bottomSheetRef.current?.dismiss();
  };

  function handleOpenTag(id: string) {
    setTagId(id);
    bottomSheetRef.current?.present();
  };

  function handleCloseEditTag() {
    setTagId('');
    fetchTags();
    bottomSheetRef.current?.dismiss();
  };

  async function handleClickDeleteTag() {
    Alert.alert("Exclusão de etiqueta", "Tem certeza que deseja excluir a etiqueta?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a etiqueta.", onPress: () => handleDeleteTag(tagId) }])
  };

  async function handleDeleteTag(id: string) {
    try {
      await api.delete('delete_tag', {
        params: {
          tag_id: id
        }
      });
      Alert.alert("Exclusão de etiqueta", "Etiqueta excluída com sucesso!")
      handleCloseRegisterTagModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Exclusão de etiqueta", error.response?.data.message, [{ text: "Tentar novamente" }, { text: "Voltar para a tela anterior", onPress: handleCloseRegisterTagModal }]);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, [])
  );

  if (loading) {
    return <SkeletonCategoriesAndTagsScreen />
  }

  return (
    <Container>
      <Header type='primary' title="Etiquetas" />

      <FlatList
        data={tags}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TagListItem
            data={item}
            onPress={() => handleOpenTag(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text="Nenhuma etiqueta criada. Crie etiquetas para visualizá-las aqui." />
        )}
        initialNumToRender={50}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTags} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24
        }}
      />

      <Footer>
        <Button
          type='secondary'
          title="Criar Nova Etiqueta"
          onPress={handleOpenRegisterTagModal}
        />
      </Footer>

      <ModalView
        type={tagId != '' ? 'secondary' : 'primary'}
        title={tagId != '' ? "Editar Etiqueta" : "Criar Nova Etiqueta"}
        bottomSheetRef={bottomSheetRef}
        snapPoints={['50%']}
        closeModal={handleCloseRegisterTagModal}
        deleteChildren={handleClickDeleteTag}
      >
        <RegisterTag
          id={tagId}
          closeTag={handleCloseEditTag}
        />
      </ModalView>
    </Container>
  );
}