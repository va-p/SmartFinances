import React, { useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import {
  BudgetTotal,
  BudgetTotalDescription,
  Container,
  TransactionsContainer,
} from './styles';

import formatCurrency from '@utils/formatCurrency';

// Hooks
import { useDeleteBudgetMutation } from '@hooks/useBudgetMutations';

// Dependencies
import { ptBR } from 'date-fns/locale';
import { FlashList } from '@shopify/flash-list';
import { useRoute } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { formatDistanceToNowStrict, parse } from 'date-fns';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  EndPeriod,
  PeriodContainer,
  StartPeriod,
} from '@components/BudgetListItem/styles';
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { InsightCard } from '@components/InsightCard';
import { SectionTitle } from '@screens/Overview/styles';
import { ModalView } from '@components/Modals/ModalView';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewWithoutHeader } from '@components/Modals/ModalViewWithoutHeader';
import { BudgetPercentBar } from '@components/BudgetListItem/components/BudgetPercentBar';

import { RegisterBudget } from '@screens/RegisterBudget';
import { RegisterTransaction } from '@screens/RegisterTransaction';

import { useUserConfigs } from '@storage/userConfigsStorage';

export function BudgetDetails() {
  const route = useRoute();
  const budget = route.params?.budget;
  const budgetID = budget?.id;

  const { mutate: deleteBudget } = useDeleteBudgetMutation();

  const budgetAmountReached = budget.amount_spent >= budget.amount;
  const budgetEditBottomSheetRef = useRef<BottomSheetModal>(null);
  const registerTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionID, setTransactionID] = useState('');

  const bottomTabBarHeight = useBottomTabBarHeight();
  const { hideAmount } = useUserConfigs();

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

  async function handleClickDeleteBudget() {
    Alert.alert(
      'Exclusão de orçamento',
      'ATENÇÃO! Todas as informações deste orçamento serão excluídas. Tem certeza que deseja excluir o orçamento?',
      [
        { text: 'Cancelar' },
        {
          text: 'Sim, excluir',
          style: 'destructive',
          onPress: () =>
            deleteBudget(budget.id, {
              onSuccess: () => {
                Alert.alert(
                  'Exclusão de orçamento',
                  'Orçamento excluído com sucesso!'
                );
                handleCloseEditBudgetModal();
              },
            }),
        },
      ]
    );
    handleCloseEditBudgetModal();
  }

  function handleCloseRegisterTransactionModal() {
    registerTransactionBottomSheetRef.current?.dismiss();
  }

  function handleOpenTransaction(id: string) {
    setTransactionID(id);
    registerTransactionBottomSheetRef.current?.present();
  }

  function ClearTransactionID() {
    setTransactionID('');
  }

  return (
    <Screen>
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
          <InsightCard.Description
            description={
              !budgetAmountReached
                ? `Você ainda pode gastar ${formatCurrency(
                    budget.currency.code,
                    calculateRemainderBudgetPerDay(),
                    false
                  )} por dia até o final do período do orçamento! Continue assim para manter seu orçamento dentro do planejado!`
                : `O seu orçamento foi excedido em ${formatCurrency(
                    budget.currency.code,
                    calculateRemainderBudget() * -1,
                    false
                  )}. Pare de gastar para não comprometer mais o seu orçamento!`
            }
          />
        </InsightCard.Root>

        <BudgetPercentBar
          is_amount_reached={budgetAmountReached}
          data={budget}
        />
        <PeriodContainer>
          <StartPeriod>{budget.start_date}</StartPeriod>
          <EndPeriod>{budget.end_date}</EndPeriod>
        </PeriodContainer>

        <TransactionsContainer>
          <SectionTitle>Transações</SectionTitle>
          <FlashList
            data={budget.transactions}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={92}
            renderItem={({ item, index }: any) => (
              <TransactionListItem
                data={item}
                index={index}
                hideAmount={hideAmount}
                onPress={() => handleOpenTransaction(item.id)}
              />
            )}
            ListEmptyComponent={() => (
              <ListEmptyComponent text='Nenhuma transação deste orçamento. Crie ou importe transações de categorias deste orçamento para visualizá-las aqui.' />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ minHeight: 8, maxHeight: 8 }} />
            )}
            contentContainerStyle={{
              paddingBottom: bottomTabBarHeight,
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
            id={budgetID}
            closeBudget={handleCloseEditBudgetModal}
          />
        </ModalView>

        <ModalViewWithoutHeader
          bottomSheetRef={registerTransactionBottomSheetRef}
          snapPoints={['100%']}
        >
          <RegisterTransaction
            id={transactionID}
            resetId={ClearTransactionID}
            closeRegisterTransaction={handleCloseRegisterTransactionModal}
            closeModal={handleCloseRegisterTransactionModal}
          />
        </ModalViewWithoutHeader>
      </Container>
    </Screen>
  );
}
