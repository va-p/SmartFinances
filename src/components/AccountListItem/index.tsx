import React from 'react';
import {
  Container,
  Content,
  DetailsContainer,
  IconContainer,
  NameContainer,
  Name,
  Amount,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
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
}

type Props = RectButtonProps & {
  data: AccountProps;
  icon: any;
};

export function AccountListItem({ data, icon, ...rest }: Props) {
  return (
    <Container>
      <Content {...rest}>
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
      </Content>
    </Container>
  );
}
