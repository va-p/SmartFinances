import React from 'react';
import {
  Container,
  Name,
  AmountContainer,
  AmountSpent,
  AmountText,
  AmountBudget,
  PeriodContainer,
  StartPeriod,
  EndPeriod,
  ChartContainer,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { VictoryBar } from 'victory-native';

import { AccountProps, CurrencyProps } from '@components/AccountListItem';
import { CategoryProps } from '@components/CategoryListItem';

export interface BudgetProps {
  id: string;
  name: string;
  amount: number;
  amount_spent: string | number;
  amount_left: string | number;
  is_amount_reached: boolean;
  percentage: number;
  currency: CurrencyProps;
  account: AccountProps;
  category: CategoryProps;
  start_date: string;
  end_date?: string;
  recurrence: string;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: BudgetProps;
};

export function BudgetListItem({ data }: Props) {
  return (
    <Container>
      <Name>{data.name}</Name>
      <AmountContainer>
        <AmountSpent is_amount_reached={data.is_amount_reached}>
          {`${data.amount_spent} `}
        </AmountSpent>
        <AmountText>gasto de </AmountText>
        <AmountBudget>{`${data.amount} orçado`}</AmountBudget>
      </AmountContainer>
      <ChartContainer></ChartContainer>
      <PeriodContainer>
        <StartPeriod>{data.start_date}</StartPeriod>
        <EndPeriod>{data.end_date}</EndPeriod>
      </PeriodContainer>
    </Container>
  );
}
