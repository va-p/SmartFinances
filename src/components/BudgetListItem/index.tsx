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
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { AccountProps, CurrencyProps } from '@components/AccountListItem';
import { BudgetPercentBar } from '@components/BudgetPercentBar';
import { CategoryProps } from '@components/CategoryListItem';
import { FadeInUp } from 'react-native-reanimated';

export interface BudgetProps {
  id: string;
  name: string;
  amount: number | string;
  amount_spent: number | string;
  percentage: number;
  currency: CurrencyProps;
  account: AccountProps;
  categories: CategoryProps[];
  start_date: string;
  end_date?: string;
  recurrence: string;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: BudgetProps;
  index: number;
};
let amount: string;

let amountSpent: string;

export function BudgetListItem({ data, index, ...rest }: Props) {
  const isAmountReached = data.amount_spent >= data.amount;

  // Format the currency
  //let amount: string;
  //let amountSpent: string;
  switch (data.currency.code) {
    case 'BRL':
      amount = data.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      amountSpent = data.amount_spent.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      break;
    case 'BTC':
      amount = data.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BTC',
        minimumFractionDigits: 8,
        maximumSignificantDigits: 8,
      });
      amountSpent = data.amount_spent.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BTC',
        minimumFractionDigits: 8,
        maximumSignificantDigits: 8,
      });
      break;
    case 'EUR':
      amount = data.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'EUR',
      });
      amountSpent = data.amount_spent.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'EUR',
      });
      break;
    case 'USD':
      amount = data.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'USD',
      });
      amountSpent = data.amount_spent.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'USD',
      });
      break;
  }

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <Name>{data.name}</Name>
      <AmountContainer>
        <AmountSpent is_amount_reached={isAmountReached}>
          {`${amountSpent} `}
        </AmountSpent>
        <AmountText>gasto de </AmountText>
        <AmountBudget>{`${amount} orçado`}</AmountBudget>
      </AmountContainer>

      <BudgetPercentBar
        is_amount_reached={isAmountReached}
        percentage={data.percentage}
      />
      <PeriodContainer>
        <StartPeriod>{data.start_date}</StartPeriod>
        <EndPeriod>{data.end_date}</EndPeriod>
      </PeriodContainer>
    </Container>
  );
}
