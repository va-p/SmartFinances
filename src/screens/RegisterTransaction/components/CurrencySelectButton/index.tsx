import React from 'react';
import { Container, Title, Icon } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

type Props = RectButtonProps & {
  title: string;
  iconSize?: number;
  hideArrow?: boolean;
};

export function CurrencySelectButton({
  title,
  iconSize,
  hideArrow = false,
  ...rest
}: Props) {
  return (
    <Container {...rest}>
      <Title size={iconSize}>{title}</Title>
      {!hideArrow && <Icon name='chevron-down-outline' size={iconSize} />}
    </Container>
  );
}
