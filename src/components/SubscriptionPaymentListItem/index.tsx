import React from 'react';

import {
  Container,
  DetailsContainer,
  NameContainer,
  Name,
  PaymentDate,
  RightContainer,
  Amount,
} from './styles';

import { useTheme } from 'styled-components';

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';
import DotsThree from 'phosphor-react-native/src/icons/DotsThree';

import { SubscriptionAvatar } from '@components/SubscriptionAvatar';

import { formatShortDayMonth } from '@utils/subscriptionDisplay';
import formatCurrency from '@utils/formatCurrency';

import { ThemeProps } from '@interfaces/theme';
import { SubscriptionPaymentProps } from '@interfaces/subscriptions';

type Props = RectButtonProps & {
  data: SubscriptionPaymentProps;
  index: number;
};

/**
 * Tela 5 row: avatar with paid/pending badge, name, "6 AGO." date,
 * native-currency amount and a trailing ⋮. Pressing opens the subscription
 * details screen (AD-038).
 */
export function SubscriptionPaymentListItem({ data, index, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <DetailsContainer>
        <SubscriptionAvatar
          name={data.description}
          category={data.category}
          isPaid={data.is_paid}
        />
        <NameContainer>
          <Name>{data.description}</Name>
          <PaymentDate>{formatShortDayMonth(data.date)}</PaymentDate>
        </NameContainer>
      </DetailsContainer>

      <RightContainer>
        <Amount>{formatCurrency(data.currency.code, data.amount)}</Amount>
        <DotsThree size={20} color={theme.colors.text} />
      </RightContainer>
    </Container>
  );
}
