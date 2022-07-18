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

export interface AccountProps {
  id: string;
  name: string;
  currency: string;
  simbol: string;
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
            <Currency>{data.currency}</Currency>
            <Simbol>{data.simbol}</Simbol>
          </CurrencyContainer>
        </Content>
      </Swipeable>
    </Container>
  );
}