import React from 'react';
import {
  Container,
  DescriptionAndAmountContainer,
  Description,
  AmountContainer,
  TransferDirectionIcon,
  Amount,
  LabelContainer,
  Footer,
  CategoryAndAccountContainer,
  IconContainer,
  Icon,
  DetailsContainer,
  Category,
  Account,
  AmountNotConvertedContainer,
  AmountNotConverted,
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
  amount_formatted: string | number;
  amount_not_converted?: string | number;
  currency: CurrencyProps;
  type: 'credit' | 'debit' | 'transferDebit' | 'transferCredit';
  account: AccountProps;
  category: CategoryProps;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: TransactionProps;
}

export function TransactionListItem({ data, ...rest }: Props) {
  return (
    <Container {...rest}>
      <IconContainer>
        <Icon type={data.type} name={data.category.icon.name} />
      </IconContainer>
      <DetailsContainer>
        <DescriptionAndAmountContainer>
          <Description type={data.type}>
            {data.description}
          </Description>

          <AmountContainer>
            {
              data.type === 'transferDebit' &&
              <TransferDirectionIcon name='arrow-up-outline' />
            }
            {
              data.type === 'transferCredit' &&
              <TransferDirectionIcon name='arrow-down-outline' />
            }
            <Amount type={data.type}>
              {data.type === 'debit' && '-'}
              {data.amount_formatted}
            </Amount>
          </AmountContainer>
        </DescriptionAndAmountContainer>
        <LabelContainer>
          
        </LabelContainer>

        <Footer>
          <CategoryAndAccountContainer>
            <Category>
              {data.category.name}
              {' | '}
            </Category>
            <Account>
              {data.account.name}
            </Account>
          </CategoryAndAccountContainer>
          <AmountNotConvertedContainer>
            <AmountNotConverted>
              {data.account.currency.code != data.currency.code && `${data.amount_not_converted}`}
            </AmountNotConverted>
            <Date>
              {data.created_at}
            </Date>
          </AmountNotConvertedContainer>
        </Footer>
      </DetailsContainer>
    </Container>
  )
}