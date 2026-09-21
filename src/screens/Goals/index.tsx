import React, { useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl } from 'react-native';
import {
  Container,
  HeaderActions,
  HeaderActionButton,
  SummaryCard,
  SummaryTotal,
  SummaryLabel,
  SummaryDescription,
  EmptyContainer,
  Footer,
} from './styles';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import { computeGoalProgress } from '@utils/goalCalculations';

// Hooks
import { useGoalsQuery } from '@hooks/useGoalsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Dependencies
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import { FlashList } from '@shopify/flash-list';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Icons
import { TrophyIcon } from 'phosphor-react-native/src/icons/Trophy';
import { ArchiveIcon } from 'phosphor-react-native/src/icons/Archive';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { GoalListItem } from '@components/GoalListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonBudgetsScreen } from '@components/SkeletonBudgetsScreen';

// Screens
import { RegisterGoal } from '@screens/RegisterGoal';

// Storages
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useGoalAccountsSelected } from '@stores/goalAccountsSelected';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { GoalProps } from '@interfaces/goals';

export function Goals() {
  const theme = useTheme() as ThemeProps;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const goalRegisterBottomSheetRef = useRef<BottomSheetModal>(null);

  const quotes = useQuotes();
  const { hideAmount } = useUserConfigs();

  const { data: goals, isLoading, refetch: refetchGoals } = useGoalsQuery();

  const activeGoals = useMemo(
    () => (goals ?? []).filter((goal) => goal.status === 'ACTIVE'),
    [goals]
  );

  const progressByGoal = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeGoalProgress>>();
    for (const goal of activeGoals) {
      map.set(goal.id, computeGoalProgress(goal, quotes));
    }
    return map;
  }, [activeGoals, quotes]);

  // Summary: total saved across active goals, normalized to BRL like the
  // Accounts screen total.
  const totalSavedFormatted = useMemo(() => {
    const total = activeGoals.reduce((sum, goal) => {
      const progress = progressByGoal.get(goal.id);
      if (!progress) {
        return sum;
      }
      if (goal.currency.code === 'BRL') {
        return sum + progress.currentAmount;
      }
      try {
        return (
          sum +
          convertCurrency({
            amount: progress.currentAmount,
            fromCurrency: goal.currency.code,
            toCurrency: 'BRL',
            accountCurrency: goal.currency.code,
            quotes,
          })
        );
      } catch {
        return sum;
      }
    }, 0);

    return formatCurrency('BRL', total, false);
  }, [activeGoals, progressByGoal, quotes]);

  const reachedCount = useMemo(
    () =>
      activeGoals.filter((goal) => progressByGoal.get(goal.id)?.isAmountReached)
        .length,
    [activeGoals, progressByGoal]
  );

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetchGoals();
    } catch (error) {
      console.error('Erro durante o refresh manual:', error);
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenRegisterGoalModal() {
    goalRegisterBottomSheetRef.current?.present();
  }

  function handleCloseRegisterGoalModal() {
    useGoalAccountsSelected.setState(() => ({ goalAccountsSelected: [] }));
    goalRegisterBottomSheetRef.current?.dismiss();
  }

  function handleOpenGoal(goal: GoalProps) {
    router.navigate({
      pathname: '/options/goals/[goalId]',
      params: { goalId: goal.id },
    });
  }

  function handleOpenCompletedGoals() {
    router.navigate('/options/goals/completed');
  }

  function handleOpenArchivedGoals() {
    router.navigate('/options/goals/archived');
  }

  if (isLoading) {
    return (
      <Screen>
        <SkeletonBudgetsScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Metas & Objetivos' />
          <HeaderActions>
            <HeaderActionButton onPress={handleOpenCompletedGoals}>
              <TrophyIcon size={20} color={theme.colors.primary} />
            </HeaderActionButton>
            <HeaderActionButton onPress={handleOpenArchivedGoals}>
              <ArchiveIcon size={20} color={theme.colors.primary} />
            </HeaderActionButton>
          </HeaderActions>
        </Header.Root>

        <SummaryCard>
          <SummaryTotal>
            {hideAmount ? '•••••' : totalSavedFormatted}
          </SummaryTotal>
          <SummaryLabel>Total em metas</SummaryLabel>
          <SummaryDescription>
            {`${activeGoals.length} ${
              activeGoals.length === 1 ? 'meta ativa' : 'metas ativas'
            }`}
            {reachedCount > 0 &&
              ` • ${reachedCount} ${
                reachedCount === 1 ? 'atingida' : 'atingidas'
              }`}
          </SummaryDescription>
        </SummaryCard>

        <FlashList
          style={{ flex: 1 }}
          data={activeGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <GoalListItem
              data={item}
              progress={
                progressByGoal.get(item.id) ?? computeGoalProgress(item, quotes)
              }
              hideAmount={hideAmount}
              index={index}
              onPress={() => handleOpenGoal(item)}
            />
          )}
          ListEmptyComponent={() => (
            <EmptyContainer>
              <ListEmptyComponent text='Nenhuma meta ativa. Crie sua primeira meta para começar a guardar.' />
            </EmptyContainer>
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
          }}
        />

        <Footer
          style={{
            paddingBottom:
              Platform.OS === 'ios'
                ? bottomTabBarHeight - 56
                : bottomTabBarHeight - 16,
          }}
        >
          <Button.Root onPress={handleOpenRegisterGoalModal}>
            <Button.Text text='Criar nova meta' />
          </Button.Root>
        </Footer>

        <ModalView
          type={'primary'}
          title={'Criar Nova Meta'}
          bottomSheetRef={goalRegisterBottomSheetRef}
          enableContentPanningGesture={false}
          enablePanDownToClose
          snapPoints={['75%']}
          closeModal={handleCloseRegisterGoalModal}
          onClose={handleCloseRegisterGoalModal}
        >
          <RegisterGoal id={''} closeGoal={handleCloseRegisterGoalModal} />
        </ModalView>
      </Container>
    </Screen>
  );
}
