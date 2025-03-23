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
  Footer,
} from './styles';

import { icons } from '@utils/icons';
import { colors } from '@utils/colors';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/Button';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';

import { useUser } from 'src/storage/userStorage';

import { ColorProps, IconProps } from '@interfaces/categories';

import api from '@api/api';
import { Gradient } from '@components/Gradient';

type Props = {
  id: string;
  closeCategory: () => void;
};

type FormData = {
  name: string;
  currency: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome da categoria'),
});
/* Validation Form - End */

export function RegisterCategory({ id, closeCategory }: Props) {
  const userID = useUser((state) => state.id);
  const [iconSelected, setIconSelected] = useState({
    id: '',
    title: 'Selecione o ícone',
    name: '',
  } as IconProps);
  const [colorSelected, setColorSelected] = useState({
    id: '',
    name: 'Selecione a cor',
    hex: '#969CB2',
    color_code: 'rgba(150, 156, 178, 1)',
  } as ColorProps);
  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
    },
  });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function handleColorSelect(color: ColorProps) {
    setColorSelected(color);
  }

  function handleIconSelect(icon: IconProps) {
    setIconSelected(icon);
  }

  function handleCloseCategory() {
    reset();
    setIconSelected({
      id: '',
      title: 'Selecione o ícone',
      name: '',
    });
    setColorSelected({
      id: '',
      name: 'Selecione a cor',
      hex: '#969CB2',
      color_code: 'rgba(150, 156, 178, 1)',
    });
    closeCategory();
  }

  async function handleEditCategory(id: string, form: FormData) {
    setButtonIsLoading(true);

    const categoryEdited = {
      category_id: id,
      name: form.name,
      icon: iconSelected,
      color: colorSelected,
    };
    try {
      const { status } = await api.patch('category/edit', categoryEdited);

      if (status === 200) {
        Alert.alert('Edição de categoria', 'Categoria editada com sucesso!', [
          { text: 'Voltar para as categorias', onPress: handleCloseCategory },
        ]);
      }
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Edição de categoria', error.response?.data.message, [
          { text: 'Tentar novamente' },
          { text: 'Voltar para a tela anterior', onPress: handleCloseCategory },
        ]);
      }
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleRegisterCategory(form: FormData) {
    setButtonIsLoading(true);

    /* Validation Form - Start */
    if (iconSelected.id === '') {
      return Alert.alert(
        'Cadastro de categoria',
        'Selecione o ícone da categoria.',
        [
          {
            text: 'OK',
            onPress: () => setButtonIsLoading(false),
          },
        ]
      );
    }

    if (colorSelected.id === '') {
      return Alert.alert(
        'Cadastro de categoria',
        'Selecione a cor da categoria.',
        [
          {
            text: 'OK',
            onPress: () => setButtonIsLoading(false),
          },
        ]
      );
    }
    /* Validation Form - End */

    // Edit Category
    if (id !== '') {
      handleEditCategory(id, form);
    }
    // Add Category
    else {
      try {
        const newCategory = {
          name: form.name,
          icon: iconSelected,
          color: colorSelected,
          user_id: userID,
        };
        const { status } = await api.post('category', newCategory);
        if (status === 200) {
          Alert.alert(
            'Cadastro de Categoria',
            'Categoria cadastrada com sucesso!',
            [
              { text: 'Cadastrar nova categoria' },
              {
                text: 'Voltar para a tela anterior',
                onPress: handleCloseCategory,
              },
            ]
          );
        }
        reset();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert('Cadastro de Categoria', error.response?.data.message, [
            { text: 'Tentar novamente' },
            {
              text: 'Voltar para a tela anterior',
              onPress: handleCloseCategory,
            },
          ]);
        }
      } finally {
        setButtonIsLoading(false);
      }
    }
  }

  async function fetchCategory() {
    setButtonIsLoading(true);

    try {
      const { data } = await api.get('category/single', {
        params: {
          category_id: id,
        },
      });
      setValue('name', data.name);
      setIconSelected(data.icon);
      setColorSelected(data.color);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categoria',
        'Não foi possível buscar a categoria. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setButtonIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (id !== '') {
        fetchCategory();
      }
    }, [id])
  );

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Gradient />

      <Header>
        <IconAndColor color={colorSelected.hex} icon={iconSelected.name}>
          <Icon name={iconSelected.name} />
        </IconAndColor>

        <ControlledInputCategoryName
          placeholder='Nome da categoria'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue={getValues('name')}
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
            <ColorContainer
              color={item.hex}
              isActive={colorSelected.id === item.id}
            >
              <Color
                color={item.hex}
                isActive={colorSelected.id === item.id}
                onPress={() => handleColorSelect(item)}
              />
            </ColorContainer>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </ColorsList>

      <IconsList>
        <Title>Ícone da categoria</Title>
        <FlatList
          data={icons}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <IconContainer
              icon={item.name}
              isActive={iconSelected.id === item.id}
              color={colorSelected.hex}
            >
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
            paddingBottom: 250,
          }}
        />
      </IconsList>

      <Footer>
        <Button.Root
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterCategory)}
        >
          <Button.Text
            text={id !== '' ? 'Editar Categoria' : 'Criar Categoria'}
          />
        </Button.Root>
      </Footer>
    </Container>
  );
}
