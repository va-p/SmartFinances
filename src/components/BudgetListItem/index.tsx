import React from 'react';
import {
  Container,
  Name,
  AmountContainer,
  AmountSpent,
  AmountBudget,
  PeriodContainer
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';

export interface BudgetProps {
  id: string;
  name: string;
  amount: string | number;
  account: AccountProps;
  category: CategoryProps;
  recurrence: string;
  startDate: Date;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: BudgetProps;
}

export function BudgetListItem({ data }: Props) {
  return (
    <Container>
      <Name>{data.name}</Name>
      <AmountContainer>
        <AmountSpent>{` gasto `}</AmountSpent>
        <AmountBudget>{`de ${data.amount} orçado`}</AmountBudget>
      </AmountContainer>
      <PeriodContainer>

      </PeriodContainer>
    </Container>
  );
}