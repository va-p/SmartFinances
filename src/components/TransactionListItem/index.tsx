import React from 'react';
import { Animated } from 'react-native';
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
  Date,
  DeleteButton,
  DeleteButtonIcon,
  DeleteButtonText,
} from './styles'

import Swipeable from 'react-native-gesture-handler/Swipeable';
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
  type: 'income' | 'outcome' | 'transfer';
  account: AccountProps;
  category: CategoryProps;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: TransactionProps;
  onSwipeableLeftOpen: () => void;
}

export function TransactionListItem({
  data,
  onSwipeableLeftOpen,
  ...rest
}: Props) {
  /*const [ category ] = categories.filter(
    item => item.key === data.category
  );*/

  function handleTransactionSwipeLeft(
    progressAnimatedValue: Animated.AnimatedInterpolation,
    dragAnimatedValue: Animated.AnimatedInterpolation
  ) {
    const delay = progressAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    const opacity = dragAnimatedValue.interpolate({
      inputRange: [-150, -50],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <DeleteButton style={{ opacity }}>
        <DeleteButtonText>Excluir</DeleteButtonText>
        <DeleteButtonIcon name='trash-outline' />
      </DeleteButton>
    )
  };

  return (
    <Container>
      <Swipeable
        renderRightActions={handleTransactionSwipeLeft}
        onSwipeableOpen={onSwipeableLeftOpen}
      >
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
                  data.type === 'transfer' &&
                  <TransferDirectionIcon name='swap-vertical-outline' />
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
      </Swipeable>
    </Container>
  )
}