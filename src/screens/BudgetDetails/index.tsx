import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  BudgetInsightCardContainer,
  BudgetInsightCardText,
  BudgetTotal,
  BudgetTotalDescription,
  Container,
} from './styles';

import { BudgetProps } from '@interfaces/budget';

import axios from 'axios';
import { VictoryPie } from 'victory-native';
import { useRoute } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';

import { Header } from '@components/Header';
import { ModalView } from '@components/ModalView';

import { RegisterBudget } from '@screens/RegisterBudget';

import api from '@api/api';

import theme from '@themes/theme';
import { BudgetPercentBar } from '@components/BudgetPercentBar';
import formatCurrency from '@utils/formatCurrency';
import {
  EndPeriod,
  PeriodContainer,
  StartPeriod,
} from '@components/BudgetListItem/styles';
import { InsightCard } from '@components/InsightCard';

export function BudgetDetails() {
  const route = useRoute();
  const budget: BudgetProps = route.params?.budget;
  const [loading, setLoading] = useState(false);

  const budgetEditBottomSheetRef = useRef<BottomSheetModal>(null);

  console.log('budget ====>', budget);

  function calculateBudget() {
    const value = Number(budget.amount) - Number(budget.amount_spent);
    return formatCurrency(budget.currency.code, value.toFixed(2), false);
  }

  function handleOpenEditBudgetModal() {
    budgetEditBottomSheetRef.current?.present();
  }

  function handleCloseEditBudgetModal() {
    // setBudgetCategoriesSelected([]);
    budgetEditBottomSheetRef.current?.dismiss();
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
          onPress: () => handleDeleteBudget(budget.id),
        },
      ]
    );
  }

  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title={`Orçamento ${budget.name}`} />
        <Header.Icon onPress={handleOpenEditBudgetModal} />
      </Header.Root>

      <BudgetTotal>{`${budget.currency.symbol} ${budget.amount}`}</BudgetTotal>
      <BudgetTotalDescription>
        {`Restam ${budget.currency.symbol} ${calculateBudget()}`}
      </BudgetTotalDescription>

      <InsightCard.Root>
        <InsightCard.Title text='Você ainda pode gastar X por dia até o final do período deste orçamento' />
      </InsightCard.Root>

      <BudgetPercentBar is_amount_reached={false} data={budget} />
      <PeriodContainer>
        <StartPeriod>{budget.start_date}</StartPeriod>
        <EndPeriod>{budget.end_date}</EndPeriod>
      </PeriodContainer>

      {/* <VictoryPie
        data={[]}
        // colorScale={totalExpensesByCategories.map(
        //   (category) => category.color.hex
        // )}
        x='percentage'
        y='amount_spent'
        width={384}
        innerRadius={80}
        labelRadius={150}
        animate={{
          duration: 2000,
          easing: 'backOut',
        }}
        // theme={smartFinancesChartTheme}
        style={{
          labels: {
            fontSize: RFValue(12),
            fontWeight: 'bold',
            fill: theme.colors.primary,
          },
          data: {
            stroke: 'none',
          },
        }}
      /> */}

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
