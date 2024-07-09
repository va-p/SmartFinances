import React, { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Container, Body, Footer } from './styles';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/Button';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';

import { useUser } from '@stores/userStore';

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
  const tenantId = useUser((state) => state.tenantId);
  const [name, setName] = useState('');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function handleCloseTag() {
    reset();
    closeTag();
  }

  async function handleEditTag(id: string, form: FormData) {
    setButtonIsLoading(true);

    const tagEdited = {
      tag_id: id,
      name: form.name,
    };

    try {
      const { status } = await api.post('edit_tag', tagEdited);

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
    if (id != '') {
      handleEditTag(id, form);
    }
    // Add Tag
    else {
      try {
        const newTag = {
          name: form.name,
          tenant_id: tenantId,
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
      const { data } = await api.get('single_tag', {
        params: {
          tag_id: id,
        },
      });
      setName(data.name);
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
      if (id != '') {
        fetchTag();
      }
    }, [id])
  );

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'position'}>
      <Body>
        <ControlledInputCategoryName
          placeholder='Nome da etiqueta'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue={name}
          name='name'
          control={control}
          error={errors.name}
          returnKeyType='go'
          onSubmitEditing={handleSubmit(handleRegisterTag)}
        />
      </Body>

      <Footer>
        <Button
          type='secondary'
          title={id != '' ? 'Editar Etiqueta' : 'Criar Etiqueta'}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterTag)}
        />
      </Footer>
    </Container>
  );
}
