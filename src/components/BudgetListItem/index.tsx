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

import formatCurrency from '@utils/formatCurrency';

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';

import { BudgetPercentBar } from '@components/BudgetListItem/components/BudgetPercentBar';

import { FormattedBudgetProps } from '@interfaces/budget';

type Props = RectButtonProps & {
  data: FormattedBudgetProps;
  index: number;
};

export function BudgetListItem({ data, index, ...rest }: Props) {
  const isAmountReached = data.amount_spent >= Number(data.amount);

  const amount = formatCurrency(data.currency.code, Number(data.amount), false);
  const amountSpent = formatCurrency(
    data.currency.code,
    Number(data.amount_spent),
    false
  );

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
        <StartPeriod>{data.formatted_start_date}</StartPeriod>
        <EndPeriod>{data.formatted_end_date}</EndPeriod>
      </PeriodContainer>
    </Container>
  );
}
