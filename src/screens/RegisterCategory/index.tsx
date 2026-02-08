import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Text } from 'react-native';
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

import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@hooks/useCategoryMutations';
import { useCategoryDetailQuery } from '@hooks/useCategoryDetailQuery';

import { icons } from '@constants/icons';
import { colors } from '@constants/colors';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';

import { useUser } from '@stores/userStorage';

import { ColorProps, IconProps } from '@interfaces/categories';

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
  const { bottom: bottomInset } = useSafeAreaInsets();
  const userID = useUser((state) => state.id);
  const [iconSelected, setIconSelected] = useState({
    id: '',
    title: 'Selecione o ícone',
    name: '',
  } as IconProps);
  const [colorSelected, setColorSelected] = useState({
    id: '',
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

  const { data: categoryData, isLoading: isLoadingDetails } =
    useCategoryDetailQuery(id);
  const { mutate: createCategory, isPending: isCreating } =
    useCreateCategoryMutation();
  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateCategoryMutation();

  useEffect(() => {
    if (categoryData) {
      setValue('name', categoryData.name);
      setIconSelected(categoryData.icon);
      setColorSelected(categoryData.color);
    } else {
      reset({ name: '' });
      setIconSelected({ id: '', title: 'Selecione o ícone', name: '' });
      setColorSelected({ id: '', color_code: 'rgba(150, 156, 178, 1)' });
    }
  }, [categoryData, id, setValue, reset]);

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
      color_code: 'rgba(150, 156, 178, 1)',
    });
    closeCategory();
  }

  function onSubmit(form: FormData) {
    /* Validation Form - Start */
    if (iconSelected.id === '') {
      return Alert.alert(
        'Cadastro de categoria',
        'Selecione o ícone da categoria.',
        [
          {
            text: 'OK',
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
          },
        ]
      );
    }
    /* Validation Form - End */

    // --- Edit Category ---
    if (!!id) {
      const categoryEdited = {
        category_id: id,
        name: form.name,
        icon: iconSelected,
        color: colorSelected,
      };
      updateCategory(categoryEdited, {
        onSuccess: () => {
          handleCloseCategory();
        },
      });
    }
    // --- Create Category ---
    else {
      const newCategory = {
        name: form.name,
        icon: iconSelected,
        color: colorSelected,
        user_id: userID,
      };
      createCategory(newCategory, {
        onSuccess: () => {
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
          reset();
          setIconSelected({ id: '', title: 'Selecione o ícone', name: '' });
          setColorSelected({ id: '', color_code: 'rgba(150, 156, 178, 1)' });
        },
      });
    }
  }

  if (isLoadingDetails) {
    return (
      <Screen>
        <Gradient />
        <Text>Carregando categoria...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Gradient />

        <Header>
          <IconAndColor
            color={colorSelected.color_code}
            icon={iconSelected.name}
          >
            <Icon name={iconSelected.name} />
          </IconAndColor>

          <ControlledInputCategoryName
            placeholder='Nome da categoria'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue={getValues('name')}
            returnKeyType='go'
            returnKeyLabel='Salvar'
            onSubmitEditing={handleSubmit(onSubmit)}
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
                color={item.color_code}
                isActive={colorSelected.id === item.id}
              >
                <Color
                  color={item.color_code}
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
                color={colorSelected.color_code}
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
              paddingBottom: 16,
            }}
          />
        </IconsList>

        <Footer bottomInset={bottomInset}>
          <Button.Root
            isLoading={isCreating || isUpdating}
            onPress={handleSubmit(onSubmit)}
          >
            <Button.Text
              text={id !== '' ? 'Editar Categoria' : 'Criar Categoria'}
            />
          </Button.Root>
        </Footer>
      </Container>
    </Screen>
  );
}
