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

import { AccountProps, CurrencyProps } from '@components/AccountListItem';
import { CategoryProps } from '@components/CategoryListItem';

export interface BudgetProps {
  id: string;
  name: string;
  amount_limit: string | number;
  amount_spent: string | number;
  currency: CurrencyProps;
  start_date: Date;
  recurrence: string;
  account: AccountProps;
  category: CategoryProps;
  tenantId: string;
}

type Props = RectButtonProps & {
  data: BudgetProps;
}

export function BudgetListItem({ data }: Props) {
  return (
    <Container>
      <Name>{data.name}</Name>
      <AmountContainer>
        <AmountSpent>{`${data.currency.symbol} ${data.amount_spent} gasto `}</AmountSpent>
        <AmountBudget>{`de ${data.currency.symbol} ${data.amount_limit} orçado`}</AmountBudget>
      </AmountContainer>
      <PeriodContainer>

      </PeriodContainer>
    </Container>
  );
}