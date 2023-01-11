import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Platform } from 'react-native';
import {
  Container,
  Header,
  IconAndColor,
  Title,
  ColorsList,
  ColorContainer,
  Color,
  IconsList,
  IconContainer,
  Icon,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';
import { ColorProps, IconProps } from '@components/CategoryListItem';
import { Button } from '@components/Button';

import { selectUserTenantId } from '@slices/userSlice';

import { colors } from '@utils/colors';
import { icons } from '@utils/icons';

import api from '@api/api';

type Props = {
  closeCategory: () => void;
  id: string;
  setId: () => void;
}

type FormData = {
  name: string;
  currency: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required("Digite o nome da categoria")
});
/* Validation Form - End */

export function RegisterCategory({ id, setId, closeCategory }: Props) {
  const tenantId = useSelector(selectUserTenantId);
  const [name, setName] = useState('');
  const [iconSelected, setIconSelected] = useState({
    id: '',
    title: 'Selecione o ícone',
    name: ''
  } as IconProps);
  const [colorSelected, setColorSelected] = useState({
    id: '',
    name: 'Selecione a cor',
    hex: '#969CB2'
  } as ColorProps);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function handleColorSelect(color: ColorProps) {
    setColorSelected(color);
  };

  function handleIconSelect(icon: IconProps) {
    setIconSelected(icon);
  };

  async function handleRegisterCategory(form: FormData) {
    setButtonIsLoading(true);

    /* Validation Form - Start */
    if (iconSelected.id === '') {
      return Alert.alert("Cadastro de categoria", "Selecione o ícone da categoria.", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    };

    if (colorSelected.id === '') {
      return Alert.alert("Cadastro de categoria", "Selecione a cor da categoria.", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    };
    /* Validation Form - End */

    // Edit Category
    if (id != '') {
      handleEditCategory(id, form);
    }
    // Add Category
    else {
      try {
        const newCategory = {
          name: form.name,
          icon: iconSelected,
          color: colorSelected,
          tenant_id: tenantId
        }
        const { status } = await api.post('category', newCategory);
        if (status === 200) {
          Alert.alert("Cadastro de Categoria", "Categoria cadastrada com sucesso!", [{ text: "Cadastrar nova categoria" }, { text: "Voltar para as categorias", onPress: closeCategory }]);

          setId();
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
        };
      } catch (error) {
        Alert.alert("Cadastro de Categoria", "Categoria já cadastrada. Por favor, digite outro nome para a categoria.", [{ text: "Tentar novamente" }, { text: "Voltar para a tela anterior", onPress: closeCategory }]);
      } finally {
        setButtonIsLoading(false);
      };
    }
  };

  async function fetchCategory() {
    try {
      const { data } = await api.get('single_category', {
        params: {
          category_id: id
        }
      })
      setName(data.name);
      setIconSelected(data.icon);
      setColorSelected(data.color);
    } catch (error) {
      console.error(error);
      Alert.alert("Categoria", "Não foi possível buscar a categoria. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  async function handleEditCategory(id: string, form: FormData) {
    setButtonIsLoading(true);

    const categoryEdited = {
      category_id: id,
      name: form.name,
      icon: iconSelected,
      color: colorSelected
    }

    try {
      const { status } = await api.post('edit_category', categoryEdited);

      if (status === 200) {
        Alert.alert("Edição de Categoria", "Categoria editada com sucesso!", [{ text: "Voltar para as categorias", onPress: closeCategory }])
      }

      setId();
    } catch (error) {
      console.error(error);
      Alert.alert("Edição de Categoria", "Não foi possível editar a categoria. Verifique sua conexão com a internet e tente novamente.")
    } finally {
      setButtonIsLoading(false);
    };
  };

  async function handleClickDeleteCategory() {
    Alert.alert("Exclusão de categoria", "Tem certeza que deseja excluir a cateogria?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a categoria.", onPress: () => handleDeleteCategory(id) }])
  };

  async function handleDeleteCategory(id: string) {
    try {
      await api.delete('delete_category', {
        params: {
          category_id: id
        }
      });
      Alert.alert("Exclusão de categoria", "Categoria excluída com sucesso!")
      handleCloseCategory();
    } catch (error) {
      Alert.alert("Exclusão de categoria", `${error}`)
    }
  };

  function handleCloseCategory() {
    setId();
    reset();
    setIconSelected({
      id: '',
      title: 'Selecione o ícone',
      name: ''
    });
    setColorSelected({
      id: '',
      name: 'Selecione a cor',
      hex: '#969CB2'
    });
    closeCategory();
  };

  useFocusEffect(useCallback(() => {
    if (id != '') {
      fetchCategory();
    }
  }, [id]));

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header>
        <IconAndColor color={colorSelected.hex} icon={iconSelected.name} isActive={iconSelected.id}>
          <Icon name={iconSelected.name} isActive={iconSelected.id} />
        </IconAndColor>

        <ControlledInputCategoryName
          placeholder='Nome da categoria'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue={name}
          name='name'
          control={control}
          error={errors.name}
        />
      </Header>

      <ColorsList>
        <Title>Cor da categoria</Title>
        <FlatList
          data={colors}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ColorContainer color={item.hex} isActive={colorSelected.id === item.id}>
              <Color
                color={item.hex}
                isActive={colorSelected.id === item.id}
                onPress={() => handleColorSelect(item)}
              />
            </ColorContainer>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10
          }}
        />
      </ColorsList>

      <IconsList>
        <Title>Ícone da categoria</Title>
        <FlatList
          data={icons}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <IconContainer icon={item.name} isActive={iconSelected.id === item.id} color={colorSelected.hex}>
              <Icon
                name={item.name}
                isActive={iconSelected.id === item.id}
                onPress={() => handleIconSelect(item)}
              />
            </IconContainer>
          )}
          numColumns={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            paddingTop: 20,
            paddingHorizontal: 10
          }}
        />
      </IconsList>

      <Footer>
        <Button
          type='secondary'
          title={id != '' ? 'Editar Categoria' : 'Criar Categoria'}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterCategory)}
        />
      </Footer>
    </Container>
  );
}