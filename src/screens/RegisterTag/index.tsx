import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { Container, Body, Footer } from './styles';

// Hooks
import { useTagDetailQuery } from '@hooks/useTagDetailQuery';
import {
  useCreateTagMutation,
  useUpdateTagMutation,
} from '@hooks/useTagMutations';

// Dependencies
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// Components
import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { ControlledInputCategoryName } from '@components/Form/ControlledInputCategoryName';

import { useUser } from '@stores/userStorage';

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
  const { data: tagData, isLoading: isLoadingDetails } = useTagDetailQuery(id);
  const { mutate: createTag, isPending: isCreating } = useCreateTagMutation();
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTagMutation();

  useEffect(() => {
    if (tagData) {
      setValue('name', tagData.name);
    } else {
      reset({ name: '' });
    }
  }, [tagData, id, setValue, reset]);

  function handleCloseTag() {
    reset();
    closeTag();
  }

  function onSubmit(form: FormData) {
    // --- Edit tag ---
    if (!!id) {
      updateTag(
        { tag_id: id, name: form.name },
        {
          onSuccess: () => {
            Alert.alert('Edição de Etiqueta', 'Etiqueta editada com sucesso!', [
              { text: 'Voltar para as etiquetas', onPress: handleCloseTag },
            ]);
          },
        }
      );
    }
    // --- Register tag ---
    else {
      createTag(
        { name: form.name, user_id: userID },
        {
          onSuccess: () => {
            Alert.alert(
              'Cadastro de Etiqueta',
              'Etiqueta cadastrada com sucesso!',
              [
                { text: 'Cadastrar nova etiqueta' },
                {
                  text: 'Voltar para a tela anterior',
                  onPress: handleCloseTag,
                },
              ]
            );
            reset();
          },
        }
      );
    }
  }

  return (
    <Screen>
      <Container>
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
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        </Body>

        <Footer>
          <Button.Root
            isLoading={isCreating || isUpdating}
            onPress={handleSubmit(onSubmit)}
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
