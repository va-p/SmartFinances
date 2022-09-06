import React from 'react';
import {
  Container,
  Content,
  Header,
  Description,
  AmountContainer,
  TransferDirectionIcon,
  Amount,
  Footer,
  Details,
  IconContainer,
  Icon,
  DetailsContainer,
  Category,
  Account,
  AmountConvertedContainer,
  AmountConverted,
  Date
} from './styles'

import { RectButtonProps } from 'react-native-gesture-handler';

import { AccountProps, CurrencyProps } from '@components/AccountListItem';
import { CategoryProps } from '@components/CategoryListItem';

export interface TransactionProps {
  id: string;
  created_at: any;
  description: string;
  amount: string | number;
  amount_not_converted?: string | number;
  currency: CurrencyProps;
  type: 'income' | 'outcome' | 'transferOut' | 'transferIn';
  account: AccountProps;
  category: CategoryProps;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: TransactionProps;
}

export function TransactionListItem({
  data,
  ...rest
}: Props) {
  return (
    <Container>
      <Content {...rest}>
        <IconContainer>
          <Icon type={data.type} name={data.category.icon.name} />
        </IconContainer>
        <DetailsContainer>
          <Header>
            <Description type={data.type}>
              {data.description}
            </Description>

            <AmountContainer>
              {
                data.type === 'transferOut' &&
                <TransferDirectionIcon name='arrow-up-outline' />
              }
              {
                data.type === 'transferIn' &&
                <TransferDirectionIcon name='arrow-down-outline' />
              }
              <Amount type={data.type}>
                {data.type === 'outcome' && '-'}
                {data.amount}
              </Amount>
            </AmountContainer>
          </Header>

          <Footer>
            <Details>
              <Category>
                {data.category.name}
                {' | '}
              </Category>
              <Account>
                {data.account.name}
              </Account>
            </Details>
            <AmountConvertedContainer>
              <AmountConverted>
                {data.account.currency.code != data.currency.code && `${data.amount_not_converted}`}
              </AmountConverted>
              <Date>
                {data.created_at}
              </Date>
            </AmountConvertedContainer>
          </Footer>
        </DetailsContainer>
      </Content>
    </Container>
  )
}