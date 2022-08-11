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

import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';


export interface TransactionProps {
  id: string;
  created_at: Date;
  description: string;
  amount: string | number;
  amountConvertedBRLFormatted?: number | null;
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
          <IconContainer>
            <Icon type={data.type} name={data.category.icon.name} />
          </IconContainer>
          <DetailsContainer>
            <Header>
              <Description type={data.type}>
                {data.description}
              </Description>

              <Amount type={data.type}>
                {data.type === 'outcome' && '- '}
                {data.amount}
              </Amount>
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
                  {data.account.currency != 'BRL - Real Brasileiro' && `aprox. ${data.amountConvertedBRLFormatted}`}
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