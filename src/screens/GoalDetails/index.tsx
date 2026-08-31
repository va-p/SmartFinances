import React, { useMemo, useRef, useState } from 'react';
import { Alert, Platform, RefreshControl, View } from 'react-native';
import {
  Container,
  HeaderCard,
  GoalCurrent,
  GoalTargetDescription,
  PercentBarContainer,
  GoalDeadline,
  ReachedBadge,
  ReachedBadgeText,
  ReadOnlyNote,
  SectionTitle,
  LinkedAccountRow,
  LinkedAccountName,
  LinkedAccountBalance,
  HistoryItemContainer,
  HistoryRow,
  HistoryDescription,
  HistoryAmount,
  HistoryDate,
  ActionsContainer,
  Footer,
  FooterButtonGroup,
  DeletePickerFooter,
  ActionButtonTouchable,
  ActionButtonIconContainer,
  ActionButtonText,
} from './styles';

import formatCurrency from '@utils/formatCurrency';
import { computeGoalProgress } from '@utils/goalCalculations';

// Hooks
import { useGoalDetailQuery } from '@hooks/useGoalDetailQuery';
import {
  useDeleteGoalMutation,
  useUpdateGoalStatusMutation,
} from '@hooks/useGoalMutations';
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Dependencies
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from 'styled-components';
import { FlashList } from '@shopify/flash-list';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Icons
import {TrashIcon} from 'phosphor-react-native/src/icons/Trash';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { TrophyIcon } from 'phosphor-react-native/src/icons/Trophy';
import { ArchiveIcon } from 'phosphor-react-native/src/icons/Archive';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ListItem } from '@components/ListItem';
import { ModalView } from '@components/Modals/ModalView';
import { ListSeparator } from '@components/ListSeparator';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonBudgetsScreen } from '@components/SkeletonBudgetsScreen';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { GoalPercentBar } from '@components/GoalListItem/components/GoalPercentBar';

// Screens
import { RegisterGoal } from '@screens/RegisterGoal';
import { RegisterGoalMovement } from '@screens/RegisterGoalMovement';

// Storages
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useGoalAccountsSelected } from '@stores/goalAccountsSelected';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { AccountProps } from '@interfaces/accounts';

export function GoalDetails() {
  const { goalId }: { goalId: string } = useLocalSearchParams();
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const goalEditBottomSheetRef = useRef<BottomSheetModal>(null);
  const movementBottomSheetRef = useRef<BottomSheetModal>(null);
  const deleteAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  const [movementType, setMovementType] = useState<'deposit' | 'withdraw'>(
    'deposit'
  );
  const [deleteDestinationAccount, setDeleteDestinationAccount] =
    useState<AccountProps | null>(null);

  const quotes = useQuotes();
  const { hideAmount } = useUserConfigs();

  const {
    data: goal,
    isLoading,
    isError,
    refetch: refetchGoal,
  } = useGoalDetailQuery(goalId);
  const { data: accountsData } = useAccountsQuery();
  const { mutate: updateGoalStatus } = useUpdateGoalStatusMutation();
  const { mutate: deleteGoal } = useDeleteGoalMutation();

  // Destination accounts for the delete transfer-back: real accounts only
  // (GOAL-26).
  const deleteDestinationAccounts = useMemo(
    () => (accountsData ?? []).filter((account) => !account.isVirtual),
    [accountsData]
  );

  const progress = useMemo(
    () => (goal ? computeGoalProgress(goal, quotes) : null),
    [goal, quotes]
  );

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetchGoal();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenEditGoalModal() {
    goalEditBottomSheetRef.current?.present();
  }

  function handleCloseEditGoalModal() {
    useGoalAccountsSelected.setState(() => ({ goalAccountsSelected: [] }));
    goalEditBottomSheetRef.current?.dismiss();
  }

  function handleFinishedEditGoal() {
    useGoalAccountsSelected.setState(() => ({ goalAccountsSelected: [] }));
    goalEditBottomSheetRef.current?.dismiss();
    refetchGoal();
  }

  function handleOpenMovementModal(type: 'deposit' | 'withdraw') {
    setMovementType(type);
    movementBottomSheetRef.current?.present();
  }

  function handleCloseMovementModal() {
    movementBottomSheetRef.current?.dismiss();
  }

  function handleClickConcludeGoal() {
    Alert.alert(
      'Concluir meta',
      'Deseja concluir esta meta? Ela sairá da lista de metas ativas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, concluir',
          onPress: () =>
            updateGoalStatus(
              { goalId, action: 'conclude' },
              { onSuccess: () => router.back() }
            ),
        },
      ]
    );
  }

  function handleClickArchiveGoal() {
    Alert.alert(
      'Arquivar meta',
      'Deseja arquivar esta meta? Você pode desarquivá-la depois.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, arquivar',
          onPress: () =>
            updateGoalStatus(
              { goalId, action: 'archive' },
              { onSuccess: () => router.back() }
            ),
        },
      ]
    );
  }

  function executeDeleteGoal(destinationAccountId?: number) {
    deleteGoal(
      { goalId, destinationAccountId },
      {
        onSuccess: () => {
          Alert.alert('Exclusão de meta', 'Meta excluída com sucesso!');
          router.back();
        },
      }
    );
  }

  // GOAL-36/37: zero balance deletes directly; balance > 0 requires a
  // destination account for the reserve transfer-back.
  function handleClickDeleteGoal() {
    const reserveBalance = Number(goal?.reserve_account?.balance ?? 0);

    if (reserveBalance <= 0) {
      Alert.alert(
        'Exclusão de meta',
        'Tem certeza que deseja excluir esta meta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, excluir',
            style: 'destructive',
            onPress: () => executeDeleteGoal(),
          },
        ]
      );
      return;
    }

    setDeleteDestinationAccount(null);
    deleteAccountBottomSheetRef.current?.present();
  }

  function handleConfirmDeleteWithDestination() {
    if (!deleteDestinationAccount) {
      return;
    }

    Alert.alert(
      'Exclusão de meta',
      `O saldo da reserva será transferido para ${deleteDestinationAccount.name} e a meta será excluída. Tem certeza?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, excluir',
          style: 'destructive',
          onPress: () => {
            deleteAccountBottomSheetRef.current?.dismiss();
            executeDeleteGoal(deleteDestinationAccount.id);
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <SkeletonBudgetsScreen />
      </Screen>
    );
  }

  if (isError || !goal || !progress) {
    return (
      <Screen>
        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Erro' />
        </Header.Root>
        <ListEmptyComponent text='Não foi possível carregar os detalhes da meta. Tente novamente.' />
      </Screen>
    );
  }

  const isActive = goal.status === 'ACTIVE';
  const reserveHistory = goal.transactions ?? [];

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title={goal.name} />
          {isActive && <Header.Icon onPress={handleOpenEditGoalModal} />}
        </Header.Root>

          <HeaderCard>
            <GoalCurrent>
              {hideAmount ? '•••••' : progress.currentFormatted}
            </GoalCurrent>
            <GoalTargetDescription>
              {`de ${
                hideAmount
                  ? '•••••'
                  : formatCurrency(
                      goal.currency.code,
                      Number(goal.target_amount)
                    )
              } (${progress.percentage.toFixed(2)}%)`}
            </GoalTargetDescription>
            <PercentBarContainer>
              <GoalPercentBar
                percentage={progress.percentage}
                isAmountReached={progress.isAmountReached}
              />
            </PercentBarContainer>
            {goal.deadline && (
              <GoalDeadline>
                {`Prazo: ${format(
                  new Date(goal.deadline),
                  'dd MMMM, yyyy',
                  {
                    locale: ptBR,
                  }
                )}`}
              </GoalDeadline>
            )}
            {progress.isAmountReached && (
              <ReachedBadge>
                <CheckIcon
                  size={12}
                  weight='bold'
                  color={theme.colors.shape}
                />
                <ReachedBadgeText> Meta atingida</ReachedBadgeText>
              </ReachedBadge>
            )}
          </HeaderCard>

          {!isActive && (
            <ReadOnlyNote>
              {goal.status === 'COMPLETED'
                ? 'Meta concluída. Somente leitura.'
                : 'Meta arquivada. Somente leitura.'}
            </ReadOnlyNote>
          )}

          {goal.linked_accounts.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <SectionTitle>Contas vinculadas</SectionTitle>
              {goal.linked_accounts.map((account) => (
                <LinkedAccountRow key={account.id}>
                  <LinkedAccountName>{account.name}</LinkedAccountName>
                  <LinkedAccountBalance>
                    {hideAmount
                      ? '•••••'
                      : formatCurrency(
                          account.currency.code,
                          Number(account.balance)
                        )}
                  </LinkedAccountBalance>
                </LinkedAccountRow>
              ))}
            </View>
          )}



          <SectionTitle>Histórico</SectionTitle>

        <FlashList
          style={{ flex: 1 }}
          data={reserveHistory}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <HistoryItemContainer>
              <HistoryRow>
                <HistoryDescription numberOfLines={1}>
                  {item.description || 'Transferência'}
                </HistoryDescription>
                <HistoryAmount type={item.type}>
                  {hideAmount
                    ? '•••••'
                    : `${
                        item.type === 'TRANSFER_CREDIT' ? '+' : '-'
                      } ${formatCurrency(
                        goal.currency.code,
                        Math.abs(Number(item.amount))
                      )}`}
                </HistoryAmount>
              </HistoryRow>
              <HistoryDate>
                {format(
                  new Date(item.transaction_date ?? item.created_at),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: ptBR }
                )}
              </HistoryDate>
            </HistoryItemContainer>
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma movimentação ainda. Deposite para começar a guardar.' />
          )}
          ItemSeparatorComponent={() => (
            <View style={{ minHeight: 8, maxHeight: 8 }} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 16,
          }}
        />

        <ActionsContainer>
          {isActive && (
            <>
              <ActionButtonTouchable onPress={handleClickConcludeGoal}>
                <ActionButtonIconContainer>
                  <TrophyIcon
                    size={24}
                    weight='bold'
                    color={theme.colors.primary}
                  />
                </ActionButtonIconContainer>
                <ActionButtonText>
                  Concluir
                </ActionButtonText>
              </ActionButtonTouchable>

              <ActionButtonTouchable onPress={handleClickArchiveGoal}>
                <ActionButtonIconContainer>
                  <ArchiveIcon
                    size={24}
                    weight='bold'
                    color={theme.colors.primary}
                  />
                </ActionButtonIconContainer>
                <ActionButtonText>
                  Arquivar
                </ActionButtonText>
              </ActionButtonTouchable>
            </>
          )}
          {goal.status === 'COMPLETED' && (
            <ActionButtonTouchable onPress={handleClickArchiveGoal}>
              <ActionButtonIconContainer>
                <ArchiveIcon
                  size={24}
                  weight='bold'
                  color={theme.colors.primary}
                />
              </ActionButtonIconContainer>
              <ActionButtonText>
                Arquivar
              </ActionButtonText>
            </ActionButtonTouchable>
          )}
          <ActionButtonTouchable onPress={handleClickDeleteGoal}>
            <ActionButtonIconContainer>
              <TrashIcon
                size={24}
                weight='bold'
                color={theme.colors.primary}
              />
            </ActionButtonIconContainer>
            <ActionButtonText>
              Excluir
            </ActionButtonText>
          </ActionButtonTouchable>
        </ActionsContainer>

        {isActive && (
          <Footer
            style={{
              paddingBottom:
                Platform.OS === 'ios'
                  ? bottomTabBarHeight - 56
                  : bottomTabBarHeight - 16,
            }}
          >
            <FooterButtonGroup>
              <Button.Root onPress={() => handleOpenMovementModal('deposit')}>
                <Button.Text text='Depositar' />
              </Button.Root>
            </FooterButtonGroup>
            <FooterButtonGroup>
              <Button.Root
                type='secondary'
                onPress={() => handleOpenMovementModal('withdraw')}
              >
                <Button.Text text='Sacar' />
              </Button.Root>
            </FooterButtonGroup>
          </Footer>
        )}

        <ModalView
          type={'primary'}
          title={'Editar Meta'}
          bottomSheetRef={goalEditBottomSheetRef}
          enableContentPanningGesture={false}
          enablePanDownToClose
          snapPoints={['75%']}
          closeModal={handleCloseEditGoalModal}
          onClose={handleCloseEditGoalModal}
        >
          <RegisterGoal id={goalId} closeGoal={handleFinishedEditGoal} />
        </ModalView>

        <ModalView
          type={'primary'}
          title={
            movementType === 'deposit' ? 'Depositar na meta' : 'Sacar da meta'
          }
          bottomSheetRef={movementBottomSheetRef}
          enableContentPanningGesture={false}
          enablePanDownToClose
          snapPoints={['60%']}
          closeModal={handleCloseMovementModal}
          onClose={handleCloseMovementModal}
        >
          <RegisterGoalMovement
            goalId={goalId}
            type={movementType}
            goal={goal}
            closeMovement={handleCloseMovementModal}
          />
        </ModalView>

        <ModalViewSelection
          $modal
          title='Conta de destino do saldo'
          bottomSheetRef={deleteAccountBottomSheetRef}
          snapPoints={['75%']}
        >
          <View style={{ flex: 1, width: '100%' }}>
            <FlatList
              data={deleteDestinationAccounts}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ListItem
                  data={item}
                  isActive={deleteDestinationAccount?.id === item.id}
                  onPress={() => setDeleteDestinationAccount(item)}
                />
              )}
              ItemSeparatorComponent={() => <ListSeparator />}
              ListEmptyComponent={() => (
                <ListEmptyComponent text='Nenhuma conta disponível para receber o saldo.' />
              )}
              style={{ flex: 1, width: '100%' }}
            />
            <DeletePickerFooter>
              <Button.Root
                enabled={!!deleteDestinationAccount}
                onPress={handleConfirmDeleteWithDestination}
              >
                <Button.Text text='Excluir e transferir saldo' />
              </Button.Root>
            </DeletePickerFooter>
          </View>
        </ModalViewSelection>
      </Container>
    </Screen>
  );
}
