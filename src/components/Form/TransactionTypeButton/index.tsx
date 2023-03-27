import React from 'react';
import { Container, Icon, Title, Button, TransactionTypeProps } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

type Props = RectButtonProps & {
  type: TransactionTypeProps;
  title: string;
  isActive: boolean;
};

const icons = {
  up: 'arrow-up-circle-outline',
  down: 'arrow-down-circle-outline',
  swap: 'swap-vertical-outline',
};

export function TransactionTypeButton({
  type,
  title,
  isActive,
  ...rest
}: Props) {
  return (
    <Container isActive={isActive} type={type}>
      <Button {...rest}>
        <Icon name={icons[type]} type={type} />
        <Title>{title}</Title>
      </Button>
    </Container>
  );
}
