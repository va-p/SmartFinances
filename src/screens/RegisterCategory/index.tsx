import React, { useState } from 'react';
import { Alert, FlatList, Platform } from 'react-native';
import {
  Container,
  Header,
  Form,
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

import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import {
  ColorProps,
  IconProps
} from '@components/CategoryListItem';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';
import { Button } from '@components/Form/Button';

import { selectUserTenantId } from '@slices/userSlice';

import { colors } from '@utils/colors';
import { icons } from '@utils/icons';

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
  const tenantId = useSelector(selectUserTenantId);
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
        Alert.alert("Cadastro de Categoria", "Categoria cadastrada com sucesso!", [{ text: "Cadastrar nova categoria" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);

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

      setButtonIsLoading(false);
    } catch (error) {
      Alert.alert("Cadastro de Categoria", "Categoria já cadastrada. Por favor, digite outro nome para a categoria.", [{ text: "Tentar novamente" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);

      setButtonIsLoading(false);
    };
  };

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
          defaultValue=''
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
          title='Criar categoria'
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleCategoryRegister)}
        />
      </Footer>
    </Container>
  );
}