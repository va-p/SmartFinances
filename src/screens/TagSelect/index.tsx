import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Container } from './styles';

import { FlatList } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

import { Load } from '@components/Load';
import { ListItem } from '@components/ListItem';
import { TagProps } from '@components/TagListItem';
import { ListSeparator } from '@components/ListSeparator';
import { ListEmptyComponent } from '@components/ListEmptyComponent';

import { useUser } from '@stores/userStore';

import api from '@api/api';

type Props = {
  tag: TagProps;
  setTag: (tag: TagProps) => void;
  closeSelectTag: () => void;
};

export function TagSelect({ tag, setTag, closeSelectTag }: Props) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useUser((state) => state.tenantId);
  const [tags, setTags] = useState<TagProps[]>([]);

  async function fetchTags() {
    setLoading(true);

    try {
      const { data } = await api.get('tag', {
        params: {
          tenant_id: tenantId,
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

  function handleTagSelect(tag: TagProps) {
    setTag(tag);
    closeSelectTag();
  }

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, [])
  );

  if (loading) {
    return <Load />;
  }

  return (
    <Container>
      <FlatList
        data={tags}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            isActive={tag.id === item.id}
            onPress={() => handleTagSelect(item)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma etiqueta criada ainda. Crie etiquetas para adicioná-las às transações.' />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTags} />
        }
        style={{ flex: 1, width: '100%' }}
      />
    </Container>
  );
}
