import React, { useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container } from './styles';

// Hooks
import { useInstitutionsQuery } from '@hooks/useInstitutionsQuery';
import { useDeleteInstitutionMutation } from '@hooks/useInstitutionMutations';

// Dependencies
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { InstitutionListItem } from '@components/InstitutionListItem';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterInstitution } from '@screens/RegisterInstitution';

export function Institutions() {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [institutionID, setInstitutionID] = useState('');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const {
    data: institutions,
    isLoading,
    refetch,
    isRefetching,
  } = useInstitutionsQuery();
  const { mutate: deleteInstitution, isPending: isDeleting } =
    useDeleteInstitutionMutation();

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenRegisterInstitutionModal() {
    setInstitutionID('');
    bottomSheetRef.current?.present();
  }

  function handleCloseRegisterInstitutionModal() {
    bottomSheetRef.current?.dismiss();
  }

  function handleOpenInstitution(ID: string) {
    setInstitutionID(ID);
    bottomSheetRef.current?.present();
  }

  function handleCloseInstitution() {
    setInstitutionID('');
    bottomSheetRef.current?.dismiss();
  }

  async function handleClickDeleteInstitution() {
    if (!institutionID) return;

    Alert.alert(
      'Exclusão de instituição',
      'ATENÇÃO! As contas vinculadas a esta instituição não serão excluídas, apenas deixarão de estar agrupadas a ela. Tem certeza que deseja excluir a instituição?',
      [
        { text: 'Cancelar' },
        {
          text: 'Sim, Excluir',
          style: 'destructive',
          onPress: () => {
            deleteInstitution(institutionID, {
              onSuccess: () => {
                handleCloseInstitution();
              },
            });
          },
        },
      ]
    );
  }

  if (isLoading || isRefetching) {
    return (
      <Screen>
        <SkeletonCategoriesAndTagsScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Instituições' />
        </Header.Root>

        <FlatList
          data={institutions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <InstitutionListItem
              data={item}
              index={index}
              onPress={() => handleOpenInstitution(item.id)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma instituição criada. Crie instituições para agrupar suas contas.' />
          )}
          initialNumToRender={50}
          refreshControl={
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListFooterComponent={
            <Button.Root
              onPress={handleOpenRegisterInstitutionModal}
              style={{ marginTop: 16 }}
            >
              <Button.Text text='Criar Nova Instituição' />
            </Button.Root>
          }
          ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 8,
            paddingBottom: bottomTabBarHeight + 16,
          }}
          showsVerticalScrollIndicator={false}
        />

        <ModalView
          type={institutionID !== '' ? 'secondary' : 'primary'}
          title={
            institutionID !== ''
              ? 'Editar Instituição'
              : 'Criar Nova Instituição'
          }
          bottomSheetRef={bottomSheetRef}
          snapPoints={['30%', '60%', '90%']}
          closeModal={handleCloseRegisterInstitutionModal}
          deleteChildren={handleClickDeleteInstitution}
        >
          <RegisterInstitution
            id={institutionID}
            closeInstitution={handleCloseInstitution}
          />
        </ModalView>
      </Container>
    </Screen>
  );
}
