import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  Title,
  Form
} from './styles';

import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import {
  CategoryListItem,
  CategoryProps,
  ColorProps,
  IconProps
} from '@components/CategoryListItem';
import { ColorSelectButton } from '@components/Form/ColorSelectButton';
import { IconSelectButton } from '@components/Form/IconSelectButton';
import { ControlledInput } from '@components/Form/ControlledInput';
import { ListSeparator } from '@components/ListSeparator';
import { useFocusEffect } from '@react-navigation/native';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Divider } from '@components/Divider';
import { Load } from '@components/Load';

import { ColorSelect } from '@screens/ColorSelect';
import { IconSelect } from '@screens/IconSelect';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

type FormData = {
  name: string;
  currency: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required("Digite o nome da categoria")
});
/* Validation Form - End */

export function RegisterCategory({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [iconSelected, setIconSelected] = useState({
    id: '',
    title: 'Selecione o ícone',
    name: ''
  } as IconProps);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorSelected, setColorSelected] = useState({
    id: '',
    name: 'Selecione a cor',
    hex: ''
  } as ColorProps);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

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

  function handleOpenSelectIconModal() {
    setIconModalOpen(true);
  };

  function handleCloseSelectIconModal() {
    setIconModalOpen(false);
  };

  function handleOpenSelectColorModal() {
    setColorModalOpen(true);
  };

  function handleCloseSelectColorModal() {
    setColorModalOpen(false);
  };

  async function handleCategoryRegister(form: FormData) {
    setButtonIsLoading(true);

    if (iconSelected.id === '')
      return Alert.alert("Cadastro de categoria", "Selecione o ícone da categoria.", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    if (colorSelected.id === '')
      return Alert.alert("Cadastro de categoria", "Selecione a cor da categoria.", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    try {
      const newCategory = {
        name: form.name,
        icon: iconSelected,
        color: colorSelected,
        tenant_id: tenantId
      }
      const { status } = await api.post('category', newCategory);
      if (status === 200) {
        Alert.alert("Cadastro de Categoria", "Categoria cadastrada com sucesso!", [{ text: "Cadastrar nova categoria" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Home') }]);

        reset();
        setIconSelected(
          {
            id: '',
            title: 'Selecione o ícone',
            name: ''
          }
        );
        setColorSelected({
          id: '',
          name: 'Selecione a cor',
          hex: ''
        });
        fetchCategories();
      };

      setButtonIsLoading(false);
    } catch (error) {
      Alert.alert("Cadastro de Categoria", "Categoria já cadastrada. Por favor, digite outro nome para a categoria.", [{ text: "Tentar novamente" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Home') }]);
      setButtonIsLoading(false);
    };
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
      fetchCategories();
      Alert.alert("Exclusão de categoria", "Categoria excluída com sucesso!")
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
      <Title>Categorias cadastradas</Title>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryListItem
            data={item}
            onSwipeableLeftOpen={() => handleCategorySwipeLeft(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCategories} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 24
        }}
      />

      <Divider />

      <Form>
        <Title>Cadastrar nova categoria</Title>
        <ControlledInput
          type='primary'
          placeholder='Nome da categoria'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue=''
          name='name'
          control={control}
          error={errors.name}
        />

        <IconSelectButton
          title={iconSelected.title}
          icon={iconSelected.name}
          onPress={handleOpenSelectIconModal}
        />

        <ColorSelectButton
          title={colorSelected.name}
          color={colorSelected.hex}
          onPress={handleOpenSelectColorModal}
        />

        <Button
          type='secondary'
          title='Cadastrar categoria'
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleCategoryRegister)}
        />
      </Form>

      <ModalView
        visible={iconModalOpen}
        closeModal={handleCloseSelectIconModal}
        title='Selecione o ícone'
      >
        <IconSelect
          icon={iconSelected}
          setIcon={setIconSelected}
          closeSelectIcon={handleCloseSelectIconModal}
        />
      </ModalView>

      <ModalView
        visible={colorModalOpen}
        closeModal={handleCloseSelectColorModal}
        title='Selecione a cor'
      >
        <ColorSelect
          color={colorSelected}
          setColor={setColorSelected}
          closeSelectColor={handleCloseSelectColorModal}
        />
      </ModalView>
    </Container>
  );
}