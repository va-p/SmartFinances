import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { BudgetListItem, BudgetProps } from '@components/BudgetListItem';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterBudget } from '@screens/RegisterBudget';

import { selectUserTenantId } from '@slices/userSlice';
import { setBudgetCategoriesSelected } from '@slices/budgetCategoriesSelectedSlice';

import formatDatePtBr from '@utils/formatDatePtBr';
import getTransactions from '@utils/getTransactions';

import api from '@api/api';

import { TransactionProps } from '@interfaces/transactions';

export function Budgets() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [budgetsFormatted, setBudgetsFormatted] = useState<BudgetProps[]>([]);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [budgetId, setBudgetId] = useState('');

  const dispatch = useDispatch();

  async function checkBudgets() {
    setLoading(true);
    setRefreshing(true);

    let budgets: any = [];
    try {
      const { data } = await api.get('budget', {
        params: {
          tenant_id: tenantId,
        },
      });

      if (data) {
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

      if (data) {
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

    if (budgets && transactions) {
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

        const start_date = formatDatePtBr().extensive(startDate);
        const end_date = formatDatePtBr().extensive(endDate);

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
    dispatch(setBudgetCategoriesSelected([]));
    checkBudgets();
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

  useFocusEffect(
    useCallback(() => {
      checkBudgets();
    }, [])
  );

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
        type={budgetId != '' ? 'secondary' : 'primary'}
        title={budgetId != '' ? 'Editar Orçamento' : 'Criar Novo Orçamento'}
        bottomSheetRef={bottomSheetRef}
        enableContentPanningGesture={false}
        snapPoints={['75%']}
        closeModal={
          budgetId != ''
            ? handleCloseEditBudgetModal
            : () => bottomSheetRef.current?.dismiss()
        }
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
