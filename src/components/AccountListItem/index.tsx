import React from 'react';
import { Animated } from 'react-native';
import {
  Container,
  Content,
  NameContainer,
  Name,
  Currency,
  CurrencyContainer,
  Simbol,
  DeleteButton,
  DeleteButtonIcon,
  DeleteButtonText
} from './styles';

import { RectButtonProps, Swipeable } from 'react-native-gesture-handler';

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
}

export interface AccountProps {
  id: string;
  created_at: string;
  name: string;
  currency: Currency;
  initial_amount: string | number;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: AccountProps;
  onSwipeableLeftOpen: () => void;
}

export function AccountListItem({ data, onSwipeableLeftOpen, ...rest }: Props) {
  function handleAccountSwipeLeft(
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
        renderRightActions={handleAccountSwipeLeft}
        onSwipeableOpen={onSwipeableLeftOpen}
      >
        <Content {...rest}>
          <NameContainer>
            <Name>{data.name}</Name>
          </NameContainer>
          <CurrencyContainer>
            <Currency>{data.currency.name}</Currency>
            <Simbol>{data.currency.symbol}</Simbol>
          </CurrencyContainer>
        </Content>
      </Swipeable>
    </Container>
  );
}