import React from 'react';
import { Animated } from 'react-native';
import {
  Container,
  Category,
  Icon,
  Color,
  Name,
  DeleteButton,
  DeleteButtonIcon,
  DeleteButtonText
} from './styles';

import { RectButtonProps, Swipeable } from 'react-native-gesture-handler';

export interface IconProps {
  id: string;
  title: string | undefined;
  name: string;
}

export interface ColorProps {
  id: string;
  name: string;
  hex: string;
}

export interface CategoryProps {
  id: string;
  created_at: string;
  name: string;
  icon: IconProps;
  color: ColorProps;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: CategoryProps;
  onSwipeableLeftOpen?: () => void;
}

export function CategoryListItem({
  data,
  onSwipeableLeftOpen,
  ...rest
}: Props) {
  function handleCategorySwipeLeft(
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
        renderRightActions={handleCategorySwipeLeft}
        onSwipeableOpen={onSwipeableLeftOpen}
      >
        <Category {...rest}>
          <Icon name={data.icon?.name} />
          <Color color={data.color.hex} />
          <Name>{data.name}</Name>
        </Category>
      </Swipeable>
    </Container >
  );
}