import React, { useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  QuickAddContainer,
  QuickAddButton,
  QuickAddButtonText,
  QuickAddInputRow,
  QuickAddInput,
  QuickAddIconButton,
  QuickAddConfirmButton,
} from './styles';

import { FlatList } from 'react-native-gesture-handler';

// Dependencies
import axios from 'axios';
import { useTheme } from 'styled-components';

// Icons
import Plus from 'phosphor-react-native/src/icons/Plus';
import Check from 'phosphor-react-native/src/icons/Check';
import X from 'phosphor-react-native/src/icons/X';

// Components
import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';
import { Load } from '@components/Button/components/Load';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { InstitutionSelectListItem } from './components/InstitutionSelectListItem';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { InstitutionProps } from '@interfaces/institutions';

// Hooks
import { useInstitutionsQuery } from '@hooks/useInstitutionsQuery';
import { useCreateInstitutionMutation } from '@hooks/useInstitutionMutations';

type Props = {
  institutionSelected: InstitutionProps | null;
  setInstitution: (institution: InstitutionProps | null) => void;
  closeSelectInstitution: () => void;
};

export function InstitutionSelect({
  institutionSelected,
  setInstitution,
  closeSelectInstitution,
}: Props) {
  const theme = useTheme() as ThemeProps;
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newInstitutionName, setNewInstitutionName] = useState('');

  const {
    data: institutions,
    isLoading,
    isError,
    refetch,
  } = useInstitutionsQuery();
  const { mutate: createInstitution, isPending: isCreating } =
    useCreateInstitutionMutation();

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleInstitutionSelect(institution: InstitutionProps) {
    setInstitution(institution);
    closeSelectInstitution();
  }

  function handleOpenQuickAdd() {
    setIsAddingNew(true);
  }

  function handleCancelQuickAdd() {
    setIsAddingNew(false);
    setNewInstitutionName('');
  }

  function handleConfirmQuickAdd() {
    const name = newInstitutionName.trim();
    if (!name) return;

    createInstitution(
      { name },
      {
        onSuccess: (createdInstitution) => {
          setInstitution(createdInstitution);
          setIsAddingNew(false);
          setNewInstitutionName('');
          closeSelectInstitution();
        },
        onError: async (error) => {
          // AC11.5: a 409 (duplicate name) is a soft conflict, not a hard
          // failure — re-fetch and silently select the existing match
          // instead of surfacing an error to the user.
          if (axios.isAxiosError(error) && error.response?.status === 409) {
            const { data: refetchedInstitutions } = await refetch();
            const existingInstitution = refetchedInstitutions?.find(
              (institution) =>
                institution.name.trim().toLowerCase() === name.toLowerCase()
            );

            if (existingInstitution) {
              setInstitution(existingInstitution);
              setIsAddingNew(false);
              setNewInstitutionName('');
              closeSelectInstitution();
            }
            return;
          }

          // Any other error: the mutation hook already shows a generic
          // Alert — just keep the inline input open so the user can retry.
        },
      }
    );
  }

  if (isLoading) {
    return <Load />;
  }

  if (isError) {
    Alert.alert(
      'Instituições',
      'Não foi possível buscar as instituições. Verifique sua conexão com a internet e tente novamente.'
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <FlatList
          data={institutions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InstitutionSelectListItem
              data={item}
              isChecked={institutionSelected?.id === item.id}
              onPress={() => handleInstitutionSelect(item)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma instituição criada ainda. Crie uma instituição para adicioná-la às contas.' />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListFooterComponent={
            <QuickAddContainer>
              {!isAddingNew ? (
                <QuickAddButton onPress={handleOpenQuickAdd}>
                  <Plus size={16} color={theme.colors.primary} />
                  <QuickAddButtonText>Nova instituição</QuickAddButtonText>
                </QuickAddButton>
              ) : (
                <QuickAddInputRow>
                  <QuickAddInput
                    placeholder='Nome da instituição'
                    autoCapitalize='sentences'
                    autoCorrect={false}
                    autoFocus
                    value={newInstitutionName}
                    onChangeText={setNewInstitutionName}
                    returnKeyType='go'
                    editable={!isCreating}
                    onSubmitEditing={handleConfirmQuickAdd}
                  />
                  <QuickAddIconButton
                    onPress={handleCancelQuickAdd}
                    enabled={!isCreating}
                  >
                    <X size={20} color={theme.colors.text} />
                  </QuickAddIconButton>
                  <QuickAddConfirmButton
                    onPress={handleConfirmQuickAdd}
                    enabled={!isCreating}
                  >
                    <Check size={20} color={theme.colors.background} />
                  </QuickAddConfirmButton>
                </QuickAddInputRow>
              )}
            </QuickAddContainer>
          }
          contentContainerStyle={{
            paddingTop: 12,
            paddingHorizontal: 12,
            paddingBottom: 12,
          }}
          style={{ flex: 1, width: '100%' }}
        />
      </Container>
    </Screen>
  );
}
