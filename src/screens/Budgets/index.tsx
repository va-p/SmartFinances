import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import { BudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

import formatDatePtBr from '@utils/formatDatePtBr';
import getTransactions from '@utils/getTransactions';
import { convertCurrency } from '@utils/convertCurrency';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { addDays, addMonths, addWeeks, addYears, endOfMonth } from 'date-fns';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { BudgetListItem } from '@components/BudgetListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonBudgetsScreen } from '@components/SkeletonBudgetsScreen';

import { RegisterBudget } from '@screens/RegisterBudget';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useBudgetCategoriesSelected } from '@storage/budgetCategoriesSelected';

import api from '@api/api';

export function Budgets({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { id: userID } = useUser();
  const [budgetsFormatted, setBudgetsFormatted] = useState<BudgetProps[]>([]);

  const budgetRegisterBottomSheetRef = useRef<BottomSheetModal>(null);

  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );

  async function checkBudgets() {
    let budgets: any = [];
    try {
      setLoading(true);
      setRefreshing(true);

      const { data } = await api.get('budget', {
        params: {
          user_id: userID,
        },
      });

      if (data.length > 0) {
        budgets = data;
      } else {
        budgets = null;
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Orçamentos',
        'Não foi possível buscar seus orçamentos. Verifique sua conexão com a internet e tente novamente.'
      );
    }

    let transactions: any = [];
    try {
      const data = await getTransactions(userID);

      if (data && data.length > 0) {
        transactions = data;
      } else {
        transactions = null;
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Transações',
        'Não foi possível buscar seus orçamentos. Verifique sua conexão com a internet e tente novamente.'
      );
    }

    if (!!budgets && !!transactions) {
      let budgetsFormatted: any = [];
      for (const budget of budgets) {
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

        const filteredTransactions: TransactionProps[] = transactions.filter(
          (transaction: TransactionProps) =>
            // budget.accounts.find((accountId: any) => accountId.account_id === transaction.account.id) &&
            budget.categories.find(
              (categoryId: any) =>
                categoryId.category_id === transaction.category.id
            ) &&
            new Date(transaction.created_at) >= startDate &&
            new Date(transaction.created_at) <= endDate
        );

        let amountSpent = 0;
        for (const transaction of filteredTransactions) {
          const isTransactionInAnotherCurrency =
            transaction.currency.code !== transaction.account.currency.code;

          // Cartão de crédito
          if (transaction.account.type === 'CREDIT') {
            // amountSpent += transaction.amount; // Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy, PORÉM, neste caso, a lógica de cálculo se inverte, pois os orçamntos são expressos sempre em valores positivos
            isTransactionInAnotherCurrency &&
            transaction.amount_in_account_currency
              ? (amountSpent += transaction.amount_in_account_currency)
              : (amountSpent += transaction.amount);
          }

          // Outros tipos de conta
          if (transaction.account.type !== 'CREDIT') {
            // amountSpent -= transaction.amount; // Neste caso, a lógica de cálculo se inverte, pois os orçamntos são expressos sempre em valores positivos
            isTransactionInAnotherCurrency &&
            transaction.amount_in_account_currency
              ? (amountSpent -= transaction.amount_in_account_currency)
              : (amountSpent -= transaction.amount);
          }
        }

        const percentage = `${((amountSpent / budget.amount) * 100).toFixed(
          2
        )}%`;

        const start_date = formatDatePtBr(startDate).extensive();
        const end_date = formatDatePtBr(endDate).extensive();

        if (!budgetsFormatted.hasOwnProperty(endDate)) {
          budgetsFormatted[budget.id] = {
            id: budget.id,
            name: budget.name,
            amount: budget.amount,
            amount_spent: amountSpent,
            percentage,
            currency: budget.currency,
            account: budget.account,
            categories: budget.categories,
            start_date,
            end_date,
            recurrence: budget.recurrence,
            tenantId: budget.tenant_id,
            user_id: userID,
            transactions: filteredTransactions,
          };
        }

        budgetsFormatted = Object.values(budgetsFormatted);
        setBudgetsFormatted(budgetsFormatted);
        setLoading(false);
        setRefreshing(false);
      }
    } else {
      setBudgetsFormatted([]);
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenRegisterBudgetModal() {
    budgetRegisterBottomSheetRef.current?.present();
  }

  function handleCloseRegisterBudgetModal() {
    setBudgetCategoriesSelected([]);
    budgetRegisterBottomSheetRef.current?.dismiss();
  }

  function handleOpenBudget(budget: BudgetProps) {
    navigation.navigate('Orçamento', {
      budget: budget,
    });
  }

  useEffect(() => {
    checkBudgets();
  }, []);

  if (loading) {
    return <SkeletonBudgetsScreen />;
  }

  return (
    <Container>
      <Header.Root>
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
          <RefreshControl refreshing={refreshing} onRefresh={checkBudgets} />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
      />

      <Footer>
        <Button
          type='secondary'
          title='Criar novo orçamento'
          onPress={handleOpenRegisterBudgetModal}
        />
      </Footer>

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
  );
}
