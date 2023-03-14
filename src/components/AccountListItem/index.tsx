import React from 'react';
import {
  Container,
  Content,
  DetailsContainer,
  IconContainer,
  Icon,
  NameContainer,
  Name,
  Amount,
  IconChevronDown,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

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
  icon: string;
  color: string;
};

export function AccountListItem({ data, icon, color, ...rest }: Props) {
  return (
    <Container>
      <Content {...rest}>
        <DetailsContainer>
          <IconContainer>
            <Icon color={color} name={icon} />
          </IconContainer>
          <NameContainer>
            <Name>{data.name}</Name>
            <Amount>{data.totalAccountAmount}</Amount>
          </NameContainer>
        </DetailsContainer>
        <IconChevronDown name='chevron-forward-outline' />
      </Content>
    </Container>
  );
}
