import React, { useEffect } from 'react';
import { Alert, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import { Container, Body, Footer } from './styles';

// Hooks
import {
  useCreateInstitutionMutation,
  useUpdateInstitutionMutation,
} from '@hooks/useInstitutionMutations';
import { useInstitutionsQuery } from '@hooks/useInstitutionsQuery';

// Dependencies
import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// Components
import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';

type Props = {
  id: string;
  closeInstitution: () => void;
};

type FormData = {
  name: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome da instituição'),
});
/* Validation Form - End */

export function RegisterInstitution({ id, closeInstitution }: Props) {
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

  // No dedicated detail-by-id endpoint hook exists for Institution (phase 4
  // only shipped useInstitutionsQuery, the list query) — the list is small
  // and already fetched by the parent Institutions screen, so we find the
  // record being edited from that cached array instead of a new network call.
  const { data: institutions } = useInstitutionsQuery();
  const institutionData = institutions?.find(
    (institution) => institution.id === id
  );

  const { mutate: createInstitution, isPending: isCreating } =
    useCreateInstitutionMutation();
  const { mutate: updateInstitution, isPending: isUpdating } =
    useUpdateInstitutionMutation();

  useEffect(() => {
    if (institutionData) {
      setValue('name', institutionData.name);
    } else {
      reset({ name: '' });
    }
  }, [institutionData, id, setValue, reset]);

  function handleCloseInstitution() {
    reset();
    closeInstitution();
  }

  function handleDuplicateNameError(error: unknown, title: string): boolean {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      Alert.alert(title, 'Já existe uma instituição com esse nome.');
      return true;
    }
    return false;
  }

  function onSubmit(form: FormData) {
    // --- Edit institution ---
    if (!!id) {
      updateInstitution(
        { institution_id: id, name: form.name },
        {
          onSuccess: () => {
            Alert.alert(
              'Edição de Instituição',
              'Instituição editada com sucesso!',
              [
                {
                  text: 'Voltar para as instituições',
                  onPress: handleCloseInstitution,
                },
              ]
            );
          },
          onError: (error) => {
            handleDuplicateNameError(error, 'Edição de Instituição');
          },
        }
      );
    }
    // --- Register institution ---
    else {
      createInstitution(
        { name: form.name },
        {
          onSuccess: () => {
            Alert.alert(
              'Cadastro de Instituição',
              'Instituição cadastrada com sucesso!',
              [
                { text: 'Cadastrar nova instituição' },
                {
                  text: 'Voltar para a tela anterior',
                  onPress: handleCloseInstitution,
                },
              ]
            );
            reset();
          },
          onError: (error) => {
            handleDuplicateNameError(error, 'Cadastro de Instituição');
          },
        }
      );
    }
  }

  return (
    <Screen>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Body>
          <ControlledInputCategoryName
            placeholder='Nome da instituição'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue={getValues('name')}
            name='name'
            control={control}
            error={errors.name}
            returnKeyType='go'
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        </Body>

        <Footer>
          <Button.Root
            isLoading={isCreating || isUpdating}
            onPress={handleSubmit(onSubmit)}
          >
            <Button.Text
              text={id !== '' ? 'Editar Instituição' : 'Criar Instituição'}
            />
          </Button.Root>
        </Footer>
      </Container>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
