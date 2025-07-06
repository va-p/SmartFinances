import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Container, Body, Footer } from './styles';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';

import { useUser } from 'src/storage/userStorage';

import api from '@api/api';

type Props = {
  id: string;
  closeTag: () => void;
};

type FormData = {
  name: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome da etiqueta'),
});
/* Validation Form - End */

export function RegisterTag({ id, closeTag }: Props) {
  const userID = useUser((state) => state.id);
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

  function handleCloseTag() {
    reset();
    closeTag();
  }

  async function handleEditTag(id: string, form: FormData) {
    try {
      setButtonIsLoading(true);

      const tagEdited = {
        tag_id: id,
        name: form.name,
      };

      const { status } = await api.patch('tag/edit', tagEdited);

      if (status === 200) {
        Alert.alert('Edição de Etiqueta', 'Etiqueta editada com sucesso!', [
          { text: 'Voltar para as etiquetas', onPress: handleCloseTag },
        ]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Edição de Etiqueta', error.response?.data.message, [
          { text: 'Tentar novamente' },
          { text: 'Voltar para a tela anterior', onPress: handleCloseTag },
        ]);
      }
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleRegisterTag(form: FormData) {
    setButtonIsLoading(true);

    // Edit Tag
    if (id !== '') {
      handleEditTag(id, form);
    }
    // Add Tag
    else {
      try {
        const newTag = {
          name: form.name,
          user_id: userID,
        };
        const { status } = await api.post('tag', newTag);
        if (status === 200) {
          Alert.alert(
            'Cadastro de Etiqueta',
            'Etiqueta cadastrada com sucesso!',
            [
              { text: 'Cadastrar nova etiqueta' },
              { text: 'Voltar para a tela anterior', onPress: handleCloseTag },
            ]
          );
        }
        reset();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert('Cadastro de Etiqueta', error.response?.data.message, [
            { text: 'Tentar novamente' },
            { text: 'Voltar para a tela anterior', onPress: handleCloseTag },
          ]);
        }
      } finally {
        setButtonIsLoading(false);
      }
    }
  }

  async function fetchTag() {
    try {
      const { data } = await api.get('tag/single', {
        params: {
          tag_id: id,
        },
      });
      setValue('name', data.name);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Etiqueta',
        'Não foi possível buscar a etiqueta. Verifique sua conexão com a internet e tente novamente.'
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (id !== '') {
        fetchTag();
      }
    }, [id])
  );

  return (
    <Screen>
      <Container>
        <Gradient />

        <Body>
          <ControlledInputCategoryName
            placeholder='Nome da etiqueta'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue={getValues('name')}
            name='name'
            control={control}
            error={errors.name}
            returnKeyType='go'
            onSubmitEditing={handleSubmit(handleRegisterTag)}
          />
        </Body>

        <Footer>
          <Button.Root
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleRegisterTag)}
          >
            <Button.Text
              text={id !== '' ? 'Editar Etiqueta' : 'Criar Etiqueta'}
            />
          </Button.Root>
        </Footer>
      </Container>
    </Screen>
  );
}
