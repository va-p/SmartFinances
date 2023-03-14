import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import { addDays, addMonths, addWeeks, addYears, format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';

import { BudgetListItem, BudgetProps } from '@components/BudgetListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { TransactionProps } from '@components/TransactionListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { RegisterBudget } from '@screens/RegisterBudget';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export function Budgets() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [budgetsFormatted, setBudgetsFormatted] = useState<BudgetProps[]>([]);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [budgetId, setBudgetId] = useState('');

  async function checkBudgets() {
    //setLoading(true);
    //setRefreshing(true);

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
        budgets = [];
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Orçamentos',
        'Não foi possível buscar seus orçamntos. Verifique sua conexão com a internet e tente novamente.'
      );
    }

    let transactions: any = [];
    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId,
        },
      });

      if (data) {
        transactions = data;
      } else {
        transactions = [];
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Transações',
        'Não foi possível buscar suas transações. Verifique sua conexão com a internet e tente novamente.'
      );
    }

    if (budgets) {
      let budgetsFormatted: any = [];
      for (const budget of budgets) {
        let startDate = addDays(new Date(budget.start_date), 1);
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
          default:
            'monthly';
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
            default:
              'monthly';
              break;
          }
        }

        const filteredTransactions = transactions.filter(
          (transaction: TransactionProps) =>
            transaction.type === 'debit' &&
            //transaction.account.id === budget.account.id &&
            transaction.category.id === budget.category.id &&
            new Date(transaction.created_at) >= startDate &&
            new Date(transaction.created_at) <= endDate
        );

        let amountSpent = filteredTransactions.reduce(
          (acc: any, transaction: TransactionProps) => acc + transaction.amount,
          0
        );

        let amountLeft: string | number = budget.amount - amountSpent;

        const isAmountReached = amountSpent >= budget.amount;
        const percentage = `${((amountSpent / budget.amount) * 100).toFixed(
          2
        )}%`;

        // Format the date
        const start_date = format(
          new Date(startDate),
          "dd 'de' MMMM 'de' yyyy",
          {
            locale: ptBR,
          }
        );
        const end_date = format(endDate, "dd 'de' MMMM 'de' yyyy", {
          locale: ptBR,
        });

        // Format the currency
        let amount: any;
        switch (budget.currency.code) {
          case 'BRL':
            amount = Number(budget.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            amountSpent = Number(amountSpent).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            amountLeft = Number(amountLeft).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            break;
          case 'BTC':
            amount = Number(budget.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8,
            });
            amountSpent = Number(amountSpent).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8,
            });
            amountLeft = Number(amountLeft).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8,
            });
            break;
          case 'EUR':
            amount = Number(budget.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'EUR',
            });
            amountSpent = Number(amountSpent).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'EUR',
            });
            amountLeft = Number(amountLeft).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'EUR',
            });
            break;
          case 'USD':
            amount = Number(budget.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD',
            });
            amountSpent = Number(amountSpent).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD',
            });
            amountLeft = Number(amountLeft).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD',
            });
            break;
        }

        // Create the objects
        if (!budgetsFormatted.hasOwnProperty(endDate)) {
          budgetsFormatted[budget.id] = {
            id: budget.id,
            name: budget.name,
            amount,
            amount_spent: amountSpent,
            amount_left: amountLeft,
            is_amount_reached: isAmountReached,
            percentage,
            currency: budget.currency,
            account: budget.account,
            category: budget.category,
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
    return budgetsFormatted;
  }

  function handleOpenRegisterBudgetModal() {
    bottomSheetRef.current?.present();
  }

  function handleCloseEditBudgetModal() {
    setBudgetId('');
    checkBudgets();
    bottomSheetRef.current?.dismiss();
  }

  async function handleDeleteBudget(id: string) {
    try {
      await api.delete('delete_budget', {
        params: {
          category_id: id,
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

  async function handleClickDeleteCategory() {
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
    return <Load />;
  }

  return (
    <Container>
      <Header type='secondary' title='Orçamentos' />

      <FlatList
        data={budgetsFormatted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BudgetListItem data={item} />}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhum orçamento criado. Crie orçamentos para visualizá-los aqui.' />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={checkBudgets} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
        }}
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
        deleteChildren={handleClickDeleteCategory}
      >
        <RegisterBudget
          id={budgetId}
          closeBudget={handleCloseEditBudgetModal}
        />
      </ModalView>
    </Container>
  );
}
