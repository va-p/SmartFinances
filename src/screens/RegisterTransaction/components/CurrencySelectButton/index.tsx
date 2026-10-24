import React from 'react';
import { Container, Title, Icon } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

type Props = RectButtonProps & {
  title: string;
  iconSize?: number;
  color: string;
  hideArrow?: boolean;
};

export function CurrencySelectButton({
  title,
  iconSize = 16,
  color,
  hideArrow = false,
  ...rest
}: Props) {
  return (
    <Container {...rest}>
      <Title size={iconSize} color={color}>
        {title}
      </Title>
      {!hideArrow && (
        <Icon name='chevron-down-outline' size={iconSize} color={color} />
      )}
    </Container>
  );
}
