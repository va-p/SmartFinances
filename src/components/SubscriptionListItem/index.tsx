import React from 'react';

import {
  Container,
  DetailsContainer,
  NameContainer,
  Name,
  Frequency,
  RightContainer,
  Amount,
} from './styles';

import { useTheme } from 'styled-components';

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';

import { SubscriptionAvatar } from '@components/SubscriptionAvatar';

import { subscriptionFrequencyText } from '@utils/subscriptionDisplay';
import formatCurrency from '@utils/formatCurrency';

import { ThemeProps } from '@interfaces/theme';
import { SubscriptionProps } from '@interfaces/subscriptions';

type Props = RectButtonProps & {
  data: SubscriptionProps;
  index: number;
};

/**
 * Tela 1 row: avatar, name, "Mensal · Dia 6", native-currency amount and a
 * chevron. Pressing opens the subscription details screen.
 */
export function SubscriptionListItem({ data, index, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <DetailsContainer>
        <SubscriptionAvatar name={data.description} category={data.category} />
        <NameContainer>
          <Name>{data.description}</Name>
          <Frequency>{subscriptionFrequencyText(data)}</Frequency>
        </NameContainer>
      </DetailsContainer>

      <RightContainer>
        <Amount>{formatCurrency(data.currency.code, data.amount)}</Amount>
        <CaretRightIcon size={16} color={theme.colors.text} />
      </RightContainer>
    </Container>
  );
}
