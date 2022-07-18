import React from 'react';
import { Animated } from 'react-native';
import {
  Container,
  Content,
  Header,
  Description,
  Amount,
  Footer,
  Details,
  Icon,
  CategoryName,
  Account,
  Date,
  DeleteButton,
  DeleteButtonIcon,
  DeleteButtonText,
} from './styles'

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButtonProps } from 'react-native-gesture-handler';

import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';


export interface TransactionProps {
  created_at: string;
  description: string;
  amount: string | number;
  amountBtc?: string | number;
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

  function handleProductSizeSwipeLeft(
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
        renderRightActions={handleProductSizeSwipeLeft}
        onSwipeableOpen={onSwipeableLeftOpen}
      >
        <Content {...rest}>
          <Header>
            <Description>
              {data.description}
            </Description>

            <Amount type={data.type}>
              {data.type === 'outcome' && '- '}
              {data.amount || data.amountBtc}
            </Amount>
          </Header>

          <Footer>
            <Details>
              <Icon name={data.category.icon?.name} />
              <CategoryName>
                {data.category?.name}
                {' | '}
              </CategoryName>
              <Account>
                {data.account?.name}
              </Account>
            </Details>
            <Date>
              {data.created_at}
            </Date>
          </Footer>
        </Content>
      </Swipeable>
    </Container>
  )
}