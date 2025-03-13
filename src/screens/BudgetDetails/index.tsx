import React, { useRef } from 'react';
import { Alert } from 'react-native';
import {
  BudgetTotal,
  BudgetTotalDescription,
  BudgetTransactions,
  Container,
  TransactionsContainer,
} from './styles';

import formatCurrency from '@utils/formatCurrency';

import axios from 'axios';
import { ptBR } from 'date-fns/locale';
import { useRoute } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { formatDistanceToNowStrict, parse } from 'date-fns';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  EndPeriod,
  PeriodContainer,
  StartPeriod,
} from '@components/BudgetListItem/styles';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { InsightCard } from '@components/InsightCard';
import { SectionTitle } from '@screens/Overview/styles';
import { ModalView } from '@components/Modals/ModalView';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { BudgetPercentBar } from '@components/BudgetListItem/components/BudgetPercentBar';

import { RegisterBudget } from '@screens/RegisterBudget';

import { useUserConfigs } from '@storage/userConfigsStorage';

import { BudgetProps } from '@interfaces/budget';

import api from '@api/api';

export function BudgetDetails() {
  const route = useRoute();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { hideAmount, setHideAmount } = useUserConfigs();
  const budget: BudgetProps = route.params?.budget;
  const budgetAmountReached = budget.amount_spent >= budget.amount;
  const budgetEditBottomSheetRef = useRef<BottomSheetModal>(null);

  function calculateRemainderBudget() {
    return Number(budget.amount) - Number(budget.amount_spent);
  }

  function calculateRemainderBudgetPerDay() {
    const now = new Date();
    const endDate = parse(budget.end_date!, "dd 'de' MMMM 'de' yyyy", now, {
      locale: ptBR,
    });

    const daysToEndDate = formatDistanceToNowStrict(endDate, {
      unit: 'day',
      locale: ptBR,
    }).split(' ')[0];

    const RemainderBudgetPerDay = (
      calculateRemainderBudget() / Number(daysToEndDate)
    ).toFixed(2);
    return Number(RemainderBudgetPerDay);
  }

  function handleOpenEditBudgetModal() {
    budgetEditBottomSheetRef.current?.present();
  }

  function handleCloseEditBudgetModal() {
    budgetEditBottomSheetRef.current?.dismiss();
  }

  async function handleDeleteBudget(id: string) {
    try {
      await api.delete('budget/delete', {
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
          onPress: () => handleDeleteBudget(budget.id),
        },
      ]
    );
  }

  return (
    <Container>
      <Gradient />

      <Header.Root>
        <Header.BackButton />
        <Header.Title title={budget.name} />
        <Header.Icon onPress={handleOpenEditBudgetModal} />
      </Header.Root>

      <BudgetTotal type={!budgetAmountReached ? 'positive' : 'negative'}>
        {formatCurrency(
          budget.currency.code,
          Number(budget.amount_spent),
          false
        )}
      </BudgetTotal>
      <BudgetTotalDescription>
        {`Restam ${formatCurrency(
          budget.currency.code,
          calculateRemainderBudget(),
          false
        )}`}
      </BudgetTotalDescription>

      <InsightCard.Root>
        <InsightCard.Title
          text={
            !budgetAmountReached
              ? `Você ainda pode gastar ${formatCurrency(
                  budget.currency.code,
                  calculateRemainderBudgetPerDay(),
                  false
                )} por dia até o final do período do orçamento`
              : `O seu orçamento foi excedido em ${formatCurrency(
                  budget.currency.code,
                  calculateRemainderBudgetPerDay() * -1,
                  false
                )}. Pare de gastar!`
          }
        />
      </InsightCard.Root>

      <BudgetPercentBar is_amount_reached={budgetAmountReached} data={budget} />
      <PeriodContainer>
        <StartPeriod>{budget.start_date}</StartPeriod>
        <EndPeriod>{budget.end_date}</EndPeriod>
      </PeriodContainer>

      <TransactionsContainer>
        <SectionTitle>Transações</SectionTitle>
        <BudgetTransactions
          data={budget.transactions}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }: any) => (
            <TransactionListItem
              data={item}
              index={index}
              hideAmount={hideAmount}
              // onPress={() => handleOpenBudget(item)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma transação deste orçamento. Crie ou importe transações de categorias deste orçamento para visualizá-las aqui.' />
          )}
          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={checkBudgets} />
          // }
          contentContainerStyle={{
            paddingBottom: bottomTabBarHeight + 8,
            rowGap: 8,
          }}
        />
      </TransactionsContainer>

      <ModalView
        type={'primary'}
        title={'Editar Orçamento'}
        bottomSheetRef={budgetEditBottomSheetRef}
        enableContentPanningGesture={false}
        enablePanDownToClose
        snapPoints={['75%']}
        closeModal={handleCloseEditBudgetModal}
        onClose={handleCloseEditBudgetModal}
        deleteChildren={handleClickDeleteBudget}
      >
        <RegisterBudget
          id={budget.id}
          closeBudget={handleCloseEditBudgetModal}
        />
      </ModalView>
    </Container>
  );
}
