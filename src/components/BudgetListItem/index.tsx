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

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';

import { BudgetPercentBar } from '@components/BudgetPercentBar';

import { BudgetProps } from '@interfaces/budget';
import formatCurrency from '@utils/formatCurrency';

type Props = RectButtonProps & {
  data: BudgetProps;
  index: number;
};
let amount: string;

let amountSpent: string;

export function BudgetListItem({ data, index, ...rest }: Props) {
  const isAmountReached = data.amount_spent >= data.amount;

  amount = formatCurrency(data.currency.code, data.amount, false);
  amountSpent = formatCurrency(data.currency.code, data.amount_spent, false);

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

      <BudgetPercentBar is_amount_reached={isAmountReached} data={data} />
      <PeriodContainer>
        <StartPeriod>{data.start_date}</StartPeriod>
        <EndPeriod>{data.end_date}</EndPeriod>
      </PeriodContainer>
    </Container>
  );
}
