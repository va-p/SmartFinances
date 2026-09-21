import React, { useMemo, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  ArchivedRow,
  UnarchiveButton,
  UnarchiveText,
} from './styles';

import { computeGoalProgress } from '@utils/goalCalculations';

// Hooks
import { useGoalsQuery } from '@hooks/useGoalsQuery';
import { useUpdateGoalStatusMutation } from '@hooks/useGoalMutations';

// Dependencies
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import { FlashList } from '@shopify/flash-list';

// Icons
import { ArchiveIcon } from 'phosphor-react-native/src/icons/Archive';

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
import { ThemeProps } from '@interfaces/theme';
import { GoalProps } from '@interfaces/goals';

export function ArchivedGoals() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const quotes = useQuotes();
  const { hideAmount } = useUserConfigs();

  const { data: goals, isLoading, refetch: refetchGoals } = useGoalsQuery();
  const { mutate: updateGoalStatus } = useUpdateGoalStatusMutation();

  const archivedGoals = useMemo(
    () => (goals ?? []).filter((goal) => goal.status === 'ARCHIVED'),
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

  // GOAL-33: unarchive restores the goal's previous status server-side.
  function handleClickUnarchive(goal: GoalProps) {
    Alert.alert(
      'Desarquivar meta',
      `Deseja desarquivar "${goal.name}"? Ela voltará para a lista anterior.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, desarquivar',
          onPress: () =>
            updateGoalStatus({ goalId: goal.id, action: 'unarchive' }),
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

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Metas Arquivadas' />
        </Header.Root>

        <FlashList
          style={{ flex: 1 }}
          data={archivedGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ArchivedRow>
              <GoalListItem
                data={item}
                progress={computeGoalProgress(item, quotes)}
                hideAmount={hideAmount}
                index={index}
                onPress={() => handleOpenGoal(item)}
              />
              <UnarchiveButton onPress={() => handleClickUnarchive(item)}>
                <ArchiveIcon size={14} color={theme.colors.primary} />
                <UnarchiveText>Desarquivar</UnarchiveText>
              </UnarchiveButton>
            </ArchivedRow>
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma meta arquivada. Arquive uma meta para visualizá-la aqui.' />
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
