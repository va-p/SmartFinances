import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import { BudgetProps } from '@interfaces/budget';
import { TransactionProps } from '@interfaces/transactions';

import formatDatePtBr from '@utils/formatDatePtBr';
import getTransactions from '@utils/getTransactions';

import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { BudgetListItem } from '@components/BudgetListItem';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterBudget } from '@screens/RegisterBudget';

import { useUser } from '@stores/userStore';
import { useBudgetCategoriesSelected } from '@stores/budgetCategoriesSelected';

import api from '@api/api';

export function Budgets() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const tenantId = useUser((state) => state.tenantId);
  const [budgetsFormatted, setBudgetsFormatted] = useState<BudgetProps[]>([]);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [budgetId, setBudgetId] = useState('');
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
          tenant_id: tenantId,
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
      const data = await getTransactions(tenantId);

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
        let endDate = new Date(startDate);

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
            endDate = addMonths(new Date(endDate), 1);
            break;
          case 'semiannually':
            endDate = addMonths(new Date(endDate), 6);
            break;
          case 'annually':
            endDate = addYears(new Date(endDate), 1);
            break;
        }

        while (endDate < new Date()) {
          startDate = endDate;
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
              endDate = addMonths(new Date(endDate), 1);
              break;
            case 'semiannually':
              endDate = addMonths(new Date(endDate), 6);
              break;
            case 'annually':
              endDate = addYears(new Date(endDate), 1);
              break;
          }
        }

        const filteredTransactions = transactions.filter(
          (transaction: TransactionProps) =>
            // budget.accounts.find((accountId: any) => accountId.account_id === transaction.account.id) &&
            budget.categories.find(
              (categoryId: any) =>
                categoryId.category_id === transaction.category.id
            ) &&
            new Date(transaction.created_at) >= startDate &&
            new Date(transaction.created_at) <= endDate
        );

        let totalRevenues = 0;
        let totalExpenses = 0;
        for (const transaction of filteredTransactions) {
          switch (transaction.type) {
            case 'credit':
              totalRevenues += transaction.amount;
              break;
            case 'debit':
              totalExpenses += transaction.amount;
              break;
          }
        }
        const amountSpent = totalExpenses - totalRevenues;

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
    bottomSheetRef.current?.present();
  }

  function handleOpenEditBudget(id: string) {
    setBudgetId(id);
    bottomSheetRef.current?.present();
  }

  function handleCloseEditBudgetModal() {
    setBudgetId('');
    setBudgetCategoriesSelected([]);
    bottomSheetRef.current?.dismiss();
  }

  async function handleDeleteBudget(id: string) {
    try {
      await api.delete('delete_budget', {
        params: {
          budget_id: id,
        },
      });
      Alert.alert('Exclusão de orçamento', 'Orçamento excluído com sucesso!');
      handleCloseEditBudgetModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Exclusão de orçamento', error.response?.data.message, [
          { text: 'Tentar novamente' },
          {
            text: 'Voltar para a tela anterior',
            onPress: handleCloseEditBudgetModal,
          },
        ]);
      }
    }
  }

  async function handleClickDeleteBudget() {
    Alert.alert(
      'Exclusão de orçamento',
      'ATENÇÃO! Todas as informações deste orçamento serão excluídas. Tem certeza que deseja excluir o orçamento?',
      [
        { text: 'Não, cancelar a exclusão' },
        {
          text: 'Sim, excluir o orçamento',
          onPress: () => handleDeleteBudget(budgetId),
        },
      ]
    );
  }

  useEffect(() => {
    checkBudgets();
  }, []);

  if (loading) {
    return <SkeletonCategoriesAndTagsScreen />;
  }

  return (
    <Container>
      <Header type='secondary' title='Orçamentos' />

      <FlatList
        data={budgetsFormatted}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <BudgetListItem
            data={item}
            index={index}
            onPress={() => handleOpenEditBudget(item.id)}
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
        type={budgetId !== '' ? 'secondary' : 'primary'}
        title={budgetId !== '' ? 'Editar Orçamento' : 'Criar Novo Orçamento'}
        bottomSheetRef={bottomSheetRef}
        enableContentPanningGesture={false}
        enablePanDownToClose
        snapPoints={['75%']}
        closeModal={
          budgetId !== ''
            ? handleCloseEditBudgetModal
            : () => bottomSheetRef.current?.dismiss()
        }
        onClose={budgetId !== '' ? handleCloseEditBudgetModal : () => null}
        deleteChildren={handleClickDeleteBudget}
      >
        <RegisterBudget
          id={budgetId}
          closeBudget={handleCloseEditBudgetModal}
        />
      </ModalView>
    </Container>
  );
}
