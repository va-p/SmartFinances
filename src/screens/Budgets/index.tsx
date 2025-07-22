import React, { useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

// Hooks
import { useBudgetsQuery } from '@hooks/useBudgetsQuery';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

// Utils
import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';

// Dependencies
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { addDays, addMonths, addWeeks, addYears, endOfMonth } from 'date-fns';

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
import { useUser } from '@storage/userStorage';
import { useBudgetCategoriesSelected } from '@storage/budgetCategoriesSelected';

// Interfaces
import { BudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

export function Budgets({ navigation }: any) {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { id: userID } = useUser();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const budgetRegisterBottomSheetRef = useRef<BottomSheetModal>(null);

  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions,
  } = useTransactionsQuery(userID);
  const {
    data: rawBudgets,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
    isRefetching: isRefetchingBudgets,
  } = useBudgetsQuery(userID);

  const budgetsFormatted = useMemo(() => {
    if (!rawBudgets || !transactions) {
      return [];
    }

    return rawBudgets.map((budget) => {
      // --- Start  of business logic to each budget ---
      let startDate = new Date(budget.start_date);
      let endDate = startDate;

      switch (budget.recurrence) {
        case 'daily':
          endDate = addDays(new Date(endDate), 1);
          break;
        case 'weekly':
          endDate = addWeeks(new Date(endDate), 1);
          break;
        case 'biweekly':
          endDate = addDays(new Date(endDate), 15);
          break;
        case 'monthly':
          endDate = endOfMonth(endDate);
          break;
        case 'semiannually':
          endDate = addMonths(new Date(endDate), 6);
          break;
        case 'annually':
          endDate = addYears(new Date(endDate), 1);
          break;
      }

      while (endDate < new Date()) {
        switch (budget.recurrence) {
          case 'daily':
            startDate = endDate;
            endDate = addDays(new Date(startDate), 1);
            break;
          case 'weekly':
            startDate = endDate;
            endDate = addWeeks(new Date(startDate), 1);
            break;
          case 'biweekly':
            startDate = endDate;
            endDate = addDays(new Date(startDate), 15);
            break;
          case 'monthly':
            startDate = addMonths(new Date(startDate), 1);
            endDate = endOfMonth(startDate);
            break;
          case 'semiannually':
            startDate = endDate;
            endDate = addMonths(new Date(startDate), 6);
            break;
          case 'annually':
            startDate = endDate;
            endDate = addYears(new Date(startDate), 1);
            break;
        }
      }

      const filteredTransactions = transactions.filter(
        (transaction: TransactionProps) =>
          budget.categories.find(
            (cat: any) => cat.category_id === transaction.category.id
          ) &&
          new Date(transaction.created_at) >= startDate &&
          new Date(transaction.created_at) <= endDate
      );

      let amountSpent = 0;
      for (const transaction of filteredTransactions) {
        const isTransactionInAnotherCurrency =
          transaction.currency.code !== transaction.account.currency.code;
        if (
          transaction.type === 'TRANSFER_CREDIT' ||
          transaction.type === 'TRANSFER_DEBIT'
        )
          continue;

        if (transaction.account.type === 'CREDIT') {
          amountSpent +=
            isTransactionInAnotherCurrency &&
            transaction.amount_in_account_currency
              ? transaction.amount_in_account_currency
              : transaction.amount;
        } else {
          amountSpent -=
            isTransactionInAnotherCurrency &&
            transaction.amount_in_account_currency
              ? transaction.amount_in_account_currency
              : transaction.amount;
        }

        transaction.amount_in_account_currency
          ? (transaction.amount_in_account_currency_formatted = formatCurrency(
              transaction.account.currency.code,
              transaction.amount_in_account_currency!
            ))
          : (transaction.amount_formatted = formatCurrency(
              transaction.account.currency.code,
              transaction.amount
            ));
      }

      const percentage = (amountSpent / Number(budget.amount)) * 100;
      const formattedStartDate = formatDatePtBr(startDate).extensive();
      const formattedEndDate = formatDatePtBr(endDate).extensive();

      return {
        ...budget,
        amount_spent: amountSpent,
        percentage,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        transactions: filteredTransactions,
      };
      // --- End of business logic ---
    });
  }, [rawBudgets, transactions]);

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
    navigation.navigate('Orçamento', {
      budget,
    });
  }

  if (isLoadingTransactions || isLoadingBudgets) {
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
          data={budgetsFormatted}
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
