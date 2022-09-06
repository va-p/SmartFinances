import React from 'react';
import { Animated } from 'react-native';
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
  DeleteButton,
  DeleteButtonIcon,
  DeleteButtonText
} from './styles';

import { RectButtonProps, Swipeable } from 'react-native-gesture-handler';

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
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: AccountProps;
  icon: string;
  color: string;
  onSwipeableLeftOpen: () => void;
}

export function AccountListItem({
  data,
  icon,
  color,
  onSwipeableLeftOpen,
  ...rest }: Props) {
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
      </Swipeable>
    </Container>
  );
}