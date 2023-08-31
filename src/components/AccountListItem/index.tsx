import React from 'react';
import {
  Container,
  DetailsContainer,
  IconContainer,
  NameContainer,
  Name,
  Amount,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { FadeInUp } from 'react-native-reanimated';
import * as Icon from 'phosphor-react-native';

import theme from '@themes/theme';

export interface CurrencyProps {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

export interface AccountProps {
  id: string;
  name: string;
  currency: CurrencyProps;
  initial_amount: string | number;
  totalAccountAmount?: string;
  tenant_id: number | null;
  hide?: boolean;
}

type Props = RectButtonProps & {
  data: AccountProps;
  index: number;
  icon: any;
};

export function AccountListItem({ data, index, icon, ...rest }: Props) {
  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <DetailsContainer>
        <IconContainer>
          <>{icon}</>
        </IconContainer>
        <NameContainer>
          <Name>{data.name}</Name>
          <Amount>{data.totalAccountAmount}</Amount>
        </NameContainer>
      </DetailsContainer>
      <Icon.CaretRight size={16} color={theme.colors.text} />
    </Container>
  );
}
