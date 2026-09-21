import React, { useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { Container } from './styles';

import { computeGoalProgress } from '@utils/goalCalculations';

// Hooks
import { useGoalsQuery } from '@hooks/useGoalsQuery';

// Dependencies
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { GoalListItem } from '@components/GoalListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonBudgetsScreen } from '@components/SkeletonBudgetsScreen';

// Storages
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';

// Interfaces
import { GoalProps } from '@interfaces/goals';

export function CompletedGoals() {
  const router = useRouter();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const quotes = useQuotes();
  const { hideAmount } = useUserConfigs();

  const { data: goals, isLoading, refetch: refetchGoals } = useGoalsQuery();

  const completedGoals = useMemo(
    () => (goals ?? []).filter((goal) => goal.status === 'COMPLETED'),
    [goals]
  );

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetchGoals();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenGoal(goal: GoalProps) {
    router.navigate({
      pathname: '/options/goals/[goalId]',
      params: { goalId: goal.id },
    });
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
          <Header.Title title='Metas Concluídas' />
        </Header.Root>

        <FlashList
          style={{ flex: 1 }}
          data={completedGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <GoalListItem
              data={item}
              progress={computeGoalProgress(item, quotes)}
              hideAmount={hideAmount}
              index={index}
              footerText={
                item.completed_at
                  ? `Concluída em ${format(
                      new Date(item.completed_at),
                      'dd MMMM, yyyy',
                      { locale: ptBR }
                    )}`
                  : undefined
              }
              onPress={() => handleOpenGoal(item)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma meta concluída ainda. Conclua uma meta para visualizá-la aqui.' />
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
      </Container>
    </Screen>
  );
}
