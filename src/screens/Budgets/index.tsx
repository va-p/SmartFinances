import React, { useRef, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

// Hooks
import { useFormattedBudgets } from '@hooks/useFormattedBudgets';

// Dependencies
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { BudgetListItem } from '@components/BudgetListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonBudgetsScreen } from '@components/SkeletonBudgetsScreen';

// Screens
import { RegisterBudget } from '@screens/RegisterBudget';

// Storages
import { useBudgetCategoriesSelected } from '@stores/budgetCategoriesSelected';

// Interfaces
import { BudgetProps } from '@interfaces/budget';

export function Budgets() {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const budgetRegisterBottomSheetRef = useRef<BottomSheetModal>(null);
  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );

  const { budgets, isLoading, refetchBudgets, refetchTransactions } =
    useFormattedBudgets();

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await Promise.all([refetchTransactions(), refetchBudgets()]);
    } catch (error) {
      console.error('Erro durante o refresh manual:', error);
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleOpenRegisterBudgetModal() {
    budgetRegisterBottomSheetRef.current?.present();
  }

  function handleCloseRegisterBudgetModal() {
    setBudgetCategoriesSelected([]);
    budgetRegisterBottomSheetRef.current?.dismiss();
    refetchBudgets();
  }

  function handleOpenBudget(budget: BudgetProps) {
    router.navigate({
      pathname: '/budgets/[budgetId]',
      params: { budgetID: budget.id },
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

        <Header.Root style={{ justifyContent: 'center' }}>
          <Header.Title title='Orçamentos' />
        </Header.Root>

        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <BudgetListItem
              data={item}
              index={index}
              onPress={() => handleOpenBudget(item)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhum orçamento criado. Crie orçamentos para visualizá-los aqui.' />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          ListFooterComponent={
            <Footer>
              <Button.Root onPress={handleOpenRegisterBudgetModal}>
                <Button.Text text='Criar novo orçamento' />
              </Button.Root>
            </Footer>
          }
          contentContainerStyle={{ paddingBottom: bottomTabBarHeight }}
        />

        <ModalView
          type={'primary'}
          title={'Criar Novo Orçamento'}
          bottomSheetRef={budgetRegisterBottomSheetRef}
          enableContentPanningGesture={false}
          enablePanDownToClose
          snapPoints={['75%']}
          closeModal={handleCloseRegisterBudgetModal}
          onClose={handleCloseRegisterBudgetModal}
        >
          <RegisterBudget
            id={null}
            closeBudget={handleCloseRegisterBudgetModal}
          />
        </ModalView>
      </Container>
    </Screen>
  );
}
